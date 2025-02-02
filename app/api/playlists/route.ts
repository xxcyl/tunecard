import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
    
    // 檢查用戶是否已登入
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log('User check:', { user, userError })

    if (userError) {
      console.error('User error:', userError)
      return NextResponse.json({ error: 'Authentication error' }, { status: 401 })
    }

    if (!user) {
      console.log('No user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, tracks } = await request.json()
    console.log('Received playlist data:', { name, tracksCount: tracks?.length })
    
    if (!name || !tracks || tracks.length === 0) {
      return NextResponse.json(
        { error: 'Name and tracks are required' },
        { status: 400 }
      )
    }

    // 驗證歌曲資料
    const invalidTracks = tracks.filter((track: any) => !track.title || !track.artist)
    if (invalidTracks.length > 0) {
      console.error('Invalid tracks found:', invalidTracks)
      return NextResponse.json(
        { error: 'All tracks must have title and artist' },
        { status: 400 }
      )
    }

    // 檢查用戶的 profile 是否存在
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // 創建播放列表
    const { data: playlist, error: playlistError } = await supabase
      .from('playlists')
      .insert({
        name,
        description,
        user_id: profile.id,
      })
      .select()
      .single()

    if (playlistError) {
      console.error('Error creating playlist:', playlistError)
      throw playlistError
    }

    // 添加歌曲到播放列表
    const playlistTracks = tracks.map((track: any, index: number) => {
      console.log('Processing track:', track)
      return {
        playlist_id: playlist.id,
        title: track.title || '',
        artist: track.artist || '',
        album: track.album || null,
        duration: track.duration || null,
        image: track.image || null,
        youtube_link: track.youtube_link || null,
        lastfm_link: track.lastfm_link || null,
        position: index + 1
      }
    })

    const { error: tracksError } = await supabase
      .from('playlist_tracks')
      .insert(playlistTracks)

    if (tracksError) {
      throw tracksError
    }

    return NextResponse.json(playlist)
  } catch (error) {
    console.error('Error creating playlist:', error)
    return NextResponse.json(
      { error: 'Failed to create playlist' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    let query = supabase
      .from('playlists')
      .select('*, playlist_tracks(*), profiles(username, avatar_url)')
      .order('created_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data: playlists, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json(playlists)
  } catch (error) {
    console.error('Error fetching playlists:', error)
    return NextResponse.json(
      { error: 'Failed to fetch playlists' },
      { status: 500 }
    )
  }
}

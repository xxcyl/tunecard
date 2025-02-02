import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Card, CardContent } from '@/components/ui/card'
import { Youtube, Music2, ExternalLink, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDuration } from '@/utils/format'
import DeletePlaylist from './delete-button'
import { redirect } from 'next/navigation'

interface Track {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  image: string
  youtube_link: string
  lastfm_link: string
  position: number
}

interface Playlist {
  id: string
  name: string
  description: string
  created_at: string
  user_id: string
  playlist_tracks: Track[]
  profiles: {
    username: string
    avatar_url: string
  }
}

export default async function PlaylistPage({ params }: { params: { id: string } }) {
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

  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: playlist, error: playlistError } = await supabase
    .from('playlists')
    .select(`
      *,
      profiles (username, avatar_url),
      playlist_tracks (*)
    `)
    .eq('id', params.id)
    .single()

  if (playlistError) {
    console.error('Error fetching playlist:', playlistError)
    redirect('/')
  }

  if (!playlist) {
    return (
      <div>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-4">播放列表未找到</h1>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{playlist.name}</h1>
              {playlist.description && (
                <p className="mt-2 text-gray-600">{playlist.description}</p>
              )}
              <div className="mt-2 text-gray-500">
                由 {playlist.profiles.username || '匿名用戶'} 創建於{' '}
                {new Date(playlist.created_at).toLocaleDateString()}
              </div>
            </div>
            {user?.id === playlist.user_id && (
              <div className="flex gap-2">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                >
                  <Link href={`/playlists/${params.id}/edit`}>
                    <Pencil className="w-4 h-4" />
                  </Link>
                </Button>
                <DeletePlaylist playlistId={params.id} />
              </div>
            )}
          </div>

          <div className="space-y-4">
            {playlist.playlist_tracks
              .sort((a: Track, b: Track) => a.position - b.position)
              .map((track: Track) => (
                <Card key={track.id}>
                  <CardContent className="flex items-center p-4">
                    {track.image ? (
                      <img
                        src={track.image}
                        alt={track.title}
                        className="w-12 h-12 object-cover rounded mr-4"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded mr-4 flex items-center justify-center">
                        <Music2 className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{track.title}</div>
                      <div className="text-sm text-gray-500">
                        {track.artist}
                        {track.album && ` • ${track.album}`}
                        {track.duration && ` • ${formatDuration(track.duration)}`}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {track.youtube_link && (
                        <a
                          href={track.youtube_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-red-500 transition-colors"
                        >
                          <Youtube className="w-5 h-5" />
                        </a>
                      )}
                      {track.lastfm_link && (
                        <a
                          href={track.lastfm_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-red-500 transition-colors"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </main>
    </div>
  )
}

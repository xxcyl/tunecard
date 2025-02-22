import { Metadata } from 'next'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const supabase = createClientComponentClient()
    type PlaylistResponse = {
      name: string;
      description: string;
      profiles: {
        username: string;
      };
      playlist_tracks: any[];
    }

    const { data: playlist } = await supabase
      .from('playlists')
      .select(`
        name,
        description,
        profiles (username),
        playlist_tracks (title)
      `)
      .eq('id', params.id)
      .single() as { data: PlaylistResponse | null }

    if (!playlist) {
      return {
        title: 'Playlist Not Found - TuneCard',
        description: 'The requested playlist could not be found.',
      }
    }

    const trackCount = playlist.playlist_tracks.length
    const description = playlist.description || 
      `由 ${playlist.profiles.username || '匿名用戶'} 創建的音樂播放清單「${playlist.name}」，包含 ${trackCount} 首歌曲。立即在 TuneCard 收聽！`

    return {
      title: `${playlist.name} - TuneCard`,
      description,
      openGraph: {
        title: `${playlist.name} - TuneCard`,
        description,
        type: 'music.playlist',
        siteName: 'TuneCard',
        locale: 'zh_TW',
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://tunecard.vercel.app'}/playlists/${params.id}`,
        images: [
          {
            url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://tunecard.vercel.app'}/playlists/${params.id}/opengraph-image?v=${Date.now()}`,
            width: 1200,
            height: 630,
            alt: `${playlist.name} - TuneCard`,
          }
        ],
      },
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_APP_URL || 'https://tunecard.vercel.app'}/playlists/${params.id}`,
      },
      other: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ? {
        'fb:app_id': process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
      } : {},
      twitter: {
        card: 'summary_large_image',
        title: playlist.name,
        description,
        images: [`/playlists/${params.id}/opengraph-image`],
      },
    }
  } catch (error) {
    return {
      title: 'TuneCard Playlist',
      description: 'Share your music story with TuneCard',
    }
  }
}

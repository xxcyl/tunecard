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
      `A playlist by ${playlist.profiles.username || 'Anonymous'} with ${trackCount} tracks`

    return {
      title: `${playlist.name} - TuneCard`,
      description,
      openGraph: {
        title: playlist.name,
        description,
        type: 'music.playlist',
        siteName: 'TuneCard',
        locale: 'zh_TW',
        images: [`${process.env.NEXT_PUBLIC_APP_URL || 'https://tunecard.vercel.app'}/playlists/${params.id}/opengraph-image`],
      },
      facebook: {
        appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
      },
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

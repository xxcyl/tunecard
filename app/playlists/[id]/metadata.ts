import { Metadata } from 'next'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const supabase = createClientComponentClient()
    const { data: playlist } = await supabase
      .from('playlists')
      .select(`
        name,
        description,
        profiles (username),
        playlist_tracks (title)
      `)
      .eq('id', params.id)
      .single()

    if (!playlist) {
      return {
        title: 'Playlist Not Found - TuneCard',
        description: 'The requested playlist could not be found.',
      }
    }

    const trackCount = playlist.playlist_tracks.length
    const description = playlist.description || 
      `A playlist by ${playlist.profiles?.username || 'Anonymous'} with ${trackCount} tracks`

    return {
      title: `${playlist.name} - TuneCard`,
      description,
      openGraph: {
        title: playlist.name,
        description,
        type: 'music.playlist',
        siteName: 'TuneCard',
        images: [`/playlists/${params.id}/opengraph-image`],
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

import { ImageResponse } from 'next/og'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const runtime = 'edge'
export const alt = 'Playlist Cover'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image({ params }: { params: { id: string } }) {
  try {
    const supabase = createClientComponentClient()
    const { data: playlist } = await supabase
      .from('playlists')
      .select(`
        name,
        description,
        profiles (username, avatar_url),
        playlist_tracks (
          image,
          title
        )
      `)
      .eq('id', params.id)
      .single()

    if (!playlist) {
      throw new Error('Playlist not found')
    }

    // 取得前4首歌的圖片
    const trackImages = playlist.playlist_tracks
      .slice(0, 4)
      .map((track: any) => track.image)
      .filter(Boolean)

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(to bottom right, #1a1b1e, #27272a)',
            padding: '40px',
          }}
        >
          {/* 播放清單圖片網格 */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '20px',
              width: '400px',
              height: '400px',
              marginBottom: '40px',
            }}
          >
            {trackImages.map((image: string, i: number) => (
              <div
                key={i}
                style={{
                  background: '#2a2b2e',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* @ts-ignore */}
                <img
                  src={image}
                  alt=""
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
            ))}
          </div>

          {/* 播放清單資訊 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: 'white',
            }}
          >
            <div
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                marginBottom: '20px',
                textAlign: 'center',
              }}
            >
              {playlist.name}
            </div>
            {playlist.description && (
              <div
                style={{
                  fontSize: '24px',
                  color: '#a1a1aa',
                  maxWidth: '800px',
                  textAlign: 'center',
                }}
              >
                {playlist.description}
              </div>
            )}
            <div
              style={{
                fontSize: '20px',
                color: '#a1a1aa',
                marginTop: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <span>Created by {playlist.profiles.username || 'Anonymous'}</span>
              <span>•</span>
              <span>{playlist.playlist_tracks.length} tracks</span>
            </div>
          </div>
        </div>
      ),
      {
        ...size,
        fonts: [
          {
            name: 'Inter',
            data: await fetch(
              new URL('../../fonts/Inter-Bold.ttf', import.meta.url)
            ).then((res) => res.arrayBuffer()),
            weight: 700,
            style: 'normal',
          },
        ],
      }
    )
  } catch (e) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#1a1b1e',
            color: 'white',
          }}
        >
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
            }}
          >
            TuneCard Playlist
          </div>
        </div>
      ),
      {
        ...size,
      }
    )
  }
}

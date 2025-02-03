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

// 確保頁面不會被快取
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface Track {
  id: string
  title: string
  artist: string
  album: string | null
  duration: number | null
  image: string | null
  youtube_link: string | null
  lastfm_link: string | null
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
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 overflow-hidden max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row">
            {/* 左側：播放列表資訊 */}
            <div className="w-full md:w-80 bg-gradient-to-br from-purple-100/50 to-purple-200/50 p-6">
              <div className="relative w-48 aspect-square mx-auto rounded-xl overflow-hidden shadow-lg">
                <div className="absolute inset-0 grid grid-cols-2 gap-0.5 p-0.5 bg-gradient-to-br from-purple-200 to-purple-300">
                  {playlist.playlist_tracks.slice(0, 4).map((track: Track, index: number) => (
                    <div key={track.id} className="relative overflow-hidden rounded-sm bg-purple-100">
                      {track.image ? (
                        <img
                          src={track.image}
                          alt={track.title}
                          className="w-full h-full object-cover"
                          style={{
                            filter: 'brightness(0.95) contrast(1.1)',
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music2 className="w-6 h-6 text-purple-400" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 to-transparent">
                  <div className="absolute bottom-0 left-0 right-0 p-2 text-white text-center">
                    <div className="backdrop-blur-sm bg-purple-900/30 rounded-md p-1.5">
                      <Music2 className="w-4 h-4 mx-auto mb-0.5" />
                      <div className="text-xs font-medium">{playlist.playlist_tracks.length} 首歌曲</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-center md:text-left">
                <h1 className="text-2xl font-bold text-gray-900">{playlist.name}</h1>
                {playlist.description && (
                  <p className="mt-2 text-sm text-gray-600">{playlist.description}</p>
                )}
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 justify-center md:justify-start">
                  <div className="flex items-center gap-2">
                    {playlist.profiles.avatar_url ? (
                      <img 
                        src={playlist.profiles.avatar_url}
                        alt={playlist.profiles.username}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-purple-200 flex items-center justify-center">
                        <span className="text-xs text-purple-600">
                          {(playlist.profiles.username || '匿名').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span>{playlist.profiles.username || '匿名用戶'}</span>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  創建於 {new Date(playlist.created_at).toLocaleDateString()}
                </div>
                {user?.id === playlist.user_id && (
                  <div className="mt-6 flex gap-2">
                    <Button
                      asChild
                      variant="outline"
                      className="w-full"
                    >
                      <Link href={`/playlists/${params.id}/edit`}>
                        <Pencil className="w-4 h-4 mr-2" />
                        編輯播放列表
                      </Link>
                    </Button>
                    <DeletePlaylist playlistId={params.id} />
                  </div>
                )}
              </div>
            </div>

            {/* 右側：歌曲列表 */}
            <div className="flex-1 border-l border-purple-100">
              <div className="max-h-[32rem] overflow-y-auto">
                {playlist.playlist_tracks
                  .sort((a: Track, b: Track) => a.position - b.position)
                  .map((track: Track, index: number) => (
                    <div 
                      key={track.id}
                      className="flex items-center gap-4 p-4 hover:bg-purple-50/50 transition-colors group border-b border-purple-50 last:border-b-0"
                    >
                      <div className="w-8 text-center font-mono text-sm text-gray-400 group-hover:text-gray-600">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <div className="w-10 h-10 flex-shrink-0 rounded overflow-hidden bg-purple-100">
                        {track.image ? (
                          <img 
                            src={track.image}
                            alt={track.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Music2 className="w-5 h-5 text-purple-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pr-4">
                        <h3 className="font-medium text-gray-900 truncate">{track.title}</h3>
                        <div className="text-sm text-gray-500 truncate">
                          {track.artist}
                          {track.album && ` • ${track.album}`}
                          {track.duration && ` • ${formatDuration(track.duration)}`}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {track.youtube_link && (
                          <a
                            href={track.youtube_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            title="在 YouTube 上播放"
                          >
                            <Youtube className="w-4 h-4" />
                          </a>
                        )}
                        {track.lastfm_link && (
                          <a
                            href={track.lastfm_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                            title="在 Last.fm 上查看"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}

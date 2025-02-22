  "use client"

import Link from 'next/link'
import { Header } from '@/components/header'
import { Card, CardContent } from '@/components/ui/card'
import { Youtube, Music2, ExternalLink, Pencil, Trash2, Copy, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  FacebookShareButton,
  TwitterShareButton,
  FacebookIcon,
  TwitterIcon
} from 'react-share'
import { formatDuration } from '@/utils/format'
import DeletePlaylist from './delete-button'
import { useState, useEffect, useRef, Suspense } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'


interface Track {
  id: string
  title: string
  artist: string
  album: string | null
  duration: number | null
  image: string | null
  youtube_link: string | null
  embedUrl?: string | null
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

export default function PlaylistPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [currentVideo, setCurrentVideo] = useState<Track | null>(null)
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/playlists/${params.id}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      setIsCopied(true)
      toast.success('已複製連結')
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      toast.error('複製連結失敗')
    }
  }

  const handleFacebookShare = () => {
    const shareUrl = `${window.location.origin}/playlists/${params.id}`
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    window.open(facebookShareUrl, '_blank', 'width=600,height=400')
  }

  const handleTwitterShare = () => {
    const shareUrl = `${window.location.origin}/playlists/${params.id}`
    const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Check out this playlist: ${playlist?.name || ''}`)}`
    window.open(twitterShareUrl, '_blank', 'width=600,height=400')
  }


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const supabase = createClientComponentClient()
        
        // 同時獲取用戶資訊和播放列表資訊
        const [userResponse, playlistResponse] = await Promise.all([
          supabase.auth.getUser(),
          supabase
            .from('playlists')
            .select(`
              *,
              profiles (username, avatar_url),
              playlist_tracks (*)
            `)
            .eq('id', params.id)
            .single()
        ])

        setUser(userResponse.data.user)

        if (playlistResponse.error) {
          throw new Error(playlistResponse.error.message)
        }

        if (!playlistResponse.data) {
          throw new Error('Playlist not found')
        }

        setPlaylist(playlistResponse.data)
      } catch (error: any) {
        console.error('Error:', error)
        setError(error.message || '載入播放清單時發生錯誤')
        // 使用 router.push 替代 window.location
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id, router])

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-4">錯誤</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/')}>返回首頁</Button>
          </div>
        </main>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-primary/10 rounded-lg ring-1 ring-primary/20"></div>
            <div className="h-8 bg-primary/10 rounded w-1/3 ring-1 ring-primary/20"></div>
            <div className="h-4 bg-primary/10 rounded w-1/4 ring-1 ring-primary/20"></div>
          </div>
        </main>
      </div>
    )
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
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Card className="border-primary/10 shadow-lg overflow-hidden max-w-6xl mx-auto bg-gradient-to-br from-background to-primary/5">
          <div className="flex flex-col md:flex-row">
            {/* 左側：播放列表資訊 */}
            <div className="w-full md:w-80 bg-primary/5 p-6 border-r border-primary/10">
              <div className="relative w-48 aspect-square mx-auto rounded-xl overflow-hidden shadow-lg ring-1 ring-primary/20">
                <div className="absolute inset-0 grid grid-cols-2 gap-0.5 p-0.5 bg-gradient-to-br from-primary/20 to-primary/30">
                  {playlist.playlist_tracks.slice(0, 4).map((track: Track, index: number) => (
                    <div key={track.id} className="relative overflow-hidden rounded-sm bg-primary/10">
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
                          <Music2 className="w-6 h-6 text-primary/60" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent">
                  <div className="absolute bottom-0 left-0 right-0 p-2 text-foreground text-center">
                    <div className="backdrop-blur-sm bg-primary/20 rounded-md p-1.5 border border-primary/30">
                      <Music2 className="w-4 h-4 mx-auto mb-0.5 text-primary" />
                      <div className="text-xs font-medium text-primary">{playlist.playlist_tracks.length} 首歌曲</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-center md:text-left">
                <h1 className="text-2xl font-bold text-foreground">{playlist.name}</h1>
                {playlist.description && (
                  <p className="mt-2 text-sm text-muted-foreground">{playlist.description}</p>
                )}
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground justify-center md:justify-start">
                  <div className="flex items-center gap-2">
                    {playlist.profiles.avatar_url ? (
                      <img 
                        src={playlist.profiles.avatar_url}
                        alt={playlist.profiles.username}
                        className="w-6 h-6 rounded-full ring-1 ring-primary/20"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                        <span className="text-xs text-primary">
                          {(playlist.profiles.username || '匿名').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span>{playlist.profiles.username || '匿名用戶'}</span>
                  </div>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  創建於 {new Date(playlist.created_at).toLocaleDateString()}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <FacebookShareButton
                    url={`${window.location.origin}/playlists/${params.id}`}
                    title={`來聽聽這個播放清單：${playlist?.name}
${window.location.origin}/playlists/${params.id}`}
                    hashtag="#TuneCard"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 border-primary/20 hover:bg-primary/10"
                    >
                      <FacebookIcon size={20} round />
                      <span>分享到 Facebook</span>
                    </Button>
                  </FacebookShareButton>

                  <TwitterShareButton
                    url={`${window.location.origin}/playlists/${params.id}`}
                    title={`來聽聽這個播放清單：${playlist?.name}`}
                    hashtags={['TuneCard', 'Music']}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 border-primary/20 hover:bg-primary/10"
                    >
                      <TwitterIcon size={20} round />
                      <span>分享到 X</span>
                    </Button>
                  </TwitterShareButton>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 border-primary/20 hover:bg-primary/10"
                    onClick={handleCopyLink}
                  >
                    {isCopied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {isCopied ? '已複製' : '複製連結'}
                  </Button>
                </div>
                {user?.id === playlist.user_id && (
                  <div className="mt-6 flex gap-2">
                    <Button
                      asChild
                      variant="outline"
                      className="w-full border-primary/20 hover:bg-primary/10"
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
            <div className="flex-1">
              <div className="max-h-[32rem] overflow-y-auto px-4">
                {playlist.playlist_tracks
                  .sort((a: Track, b: Track) => a.position - b.position)
                  .map((track: Track, index: number) => (
                    <div 
                      key={track.id}
                      className="flex items-center gap-4 p-4 hover:bg-secondary transition-colors group rounded-lg border border-border/5 hover:border-primary/20 mb-1"
                    >
                      <div className="w-8 text-center font-mono text-sm text-muted-foreground group-hover:text-primary/80">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <div className="w-10 h-10 flex-shrink-0 rounded overflow-hidden bg-primary/10 ring-1 ring-primary/10">
                        {track.image ? (
                          <img 
                            src={track.image}
                            alt={track.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Music2 className="w-5 h-5 text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pr-4">
                        <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">{track.title}</h3>
                        <div className="text-sm text-muted-foreground truncate">
                          {track.artist}
                          {track.album && ` • ${track.album}`}
                          {track.duration && ` • ${formatDuration(track.duration)}`}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {track.youtube_link && (
                          <button
                            onClick={() => setCurrentVideo(track)}
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-secondary rounded-full transition-colors"
                            title="播放 YouTube 影片"
                          >
                            <Youtube className="w-4 h-4" />
                          </button>
                        )}
                        {track.lastfm_link && (
                          <a
                            href={track.lastfm_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-secondary rounded-full transition-colors"
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
          {currentVideo && (
            <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm shadow-lg z-50">
              <div className="container mx-auto px-4 max-w-5xl">
                <div className="flex items-center gap-4 py-3">
                  <div className="w-80 h-24 bg-black rounded overflow-hidden flex-shrink-0 ring-1 ring-primary/20">
                    <iframe
                      className="w-full h-full"
                      src={currentVideo?.youtube_link ? `https://www.youtube.com/embed/${currentVideo.youtube_link.split('v=')[1]}?controls=1&modestbranding=1` : ''}
                      title="YouTube video player"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="font-medium text-foreground truncate">
                      {currentVideo.title}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {currentVideo.artist}
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => setCurrentVideo(null)}
                      className="text-primary hover:text-primary/80 p-2 hover:bg-primary/10 rounded-full transition-colors flex-shrink-0"
                      title="關閉播放器"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
      </main>
    </div>
  )
}

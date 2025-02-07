'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Pencil, Trash2, Music } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Link from 'next/link'

interface Track {
  title: string
  artist: string
  album?: string
  duration?: number | null
  image?: string | null
  youtube_link?: string
  lastfm_link?: string
  position: number
}

interface Playlist {
  id: string
  name: string
  created_at: string
  playlist_tracks: Track[]
}

export default function MyPlaylists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchPlaylists()
  }, [])

  const fetchPlaylists = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('playlists')
        .select('*, playlist_tracks(*)')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setPlaylists(data || [])
    } catch (error) {
      console.error('Error fetching playlists:', error)
      toast.error('無法載入播放列表')
    } finally {
      setLoading(false)
    }
  }

  const deletePlaylist = async (playlistId: string) => {
    try {
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', playlistId)

      if (error) throw error

      setPlaylists(playlists.filter(p => p.id !== playlistId))
      toast.success('播放列表已刪除')
    } catch (error) {
      console.error('Error deleting playlist:', error)
      toast.error('刪除失敗')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="text-center text-muted-foreground">載入中...</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-foreground">我的歌單</h1>
          
          {playlists.length === 0 ? (
            <div className="text-center py-12">
              <Music className="w-12 h-12 mx-auto mb-4 text-primary/60" />
              <p className="text-muted-foreground mb-4">你還沒有建立任何歌單</p>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/create-playlist">建立歌單</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6">
              {playlists.map((playlist) => (
                <Card key={playlist.id} className="bg-card border-border/5 hover:border-primary/20 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl text-foreground">
                        <Link 
                          href={`/playlists/${playlist.id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {playlist.name}
                        </Link>
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-primary hover:bg-secondary"
                          onClick={() => router.push(`/playlists/${playlist.id}/edit`)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive hover:bg-secondary"
                          onClick={() => {
                            if (confirm('確定要刪除這個歌單嗎？')) {
                              deletePlaylist(playlist.id)
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      {playlist.playlist_tracks.length} 首歌曲
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground/80">
                      建立於 {new Date(playlist.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

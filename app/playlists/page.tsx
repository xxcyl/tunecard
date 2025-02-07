'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/header'
import { Music2 } from 'lucide-react'

interface Playlist {
  id: string
  name: string
  description?: string
  created_at: string
  profiles: {
    username: string
    avatar_url?: string
  }
  playlist_tracks: any[]
}

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPlaylists()
  }, [])

  const fetchPlaylists = async () => {
    try {
      const { data: playlists, error } = await supabase
        .from('playlists')
        .select(`
          *,
          profiles:user_id(username, avatar_url),
          playlist_tracks (*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setPlaylists(playlists || [])
    } catch (error) {
      console.error('Error fetching playlists:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 text-foreground">所有列表</h1>
        {loading ? (
          <div className="text-center text-muted-foreground">載入中...</div>
        ) : (
          <div className="space-y-2">
            {playlists.map((playlist) => (
              <Link key={playlist.id} href={`/playlists/${playlist.id}`}>
                <div className="flex items-center gap-4 p-4 bg-card hover:bg-secondary rounded-lg transition-colors group border border-border/5 hover:border-primary/20">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden ring-1 ring-primary/10">
                    {playlist.playlist_tracks[0]?.image ? (
                      <img 
                        src={playlist.playlist_tracks[0].image} 
                        alt="Album cover" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                        <Music2 className="w-6 h-6 text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="text-lg font-semibold truncate text-foreground group-hover:text-primary transition-colors">{playlist.name}</h3>
                    {playlist.description && (
                      <p className="text-sm text-muted-foreground truncate">{playlist.description}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-sm text-muted-foreground text-right">
                    <p className="group-hover:text-primary/80 transition-colors">由 {playlist.profiles.username} 建立</p>
                    <p className="text-primary/60">{playlist.playlist_tracks.length} 首歌曲</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

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
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">所有列表</h1>
        {loading ? (
          <div className="text-center">載入中...</div>
        ) : (
          <div className="space-y-4">
            {playlists.map((playlist) => (
              <Link key={playlist.id} href={`/playlists/${playlist.id}`}>
                <div className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden">
                    {playlist.playlist_tracks[0]?.image ? (
                      <img 
                        src={playlist.playlist_tracks[0].image} 
                        alt="Album cover" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-purple-100 flex items-center justify-center">
                        <Music2 className="w-6 h-6 text-purple-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="text-lg font-semibold truncate">{playlist.name}</h3>
                    {playlist.description && (
                      <p className="text-sm text-gray-500 truncate">{playlist.description}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-sm text-gray-500 text-right">
                    <p>由 {playlist.profiles.username} 建立</p>
                    <p>{playlist.playlist_tracks.length} 首歌曲</p>
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

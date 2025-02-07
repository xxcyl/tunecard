'use client'

import Link from "next/link"
import { Music, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface Playlist {
  id: string
  name: string
  description?: string
  profiles: {
    username: string
  }
  playlist_tracks: any[]
}

export function LatestPlaylists({ playlists }: { playlists: Playlist[] }) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">最新歌單</h2>
          <p className="text-sm text-muted-foreground">發現來自不同用戶的音樂收藏</p>
        </div>
        <Link 
          href="/playlists" 
          className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
        >
          查看全部
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {!playlists || playlists.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border border-border/5">
          <Music className="w-12 h-12 mx-auto mb-4 text-primary/50" />
          <p className="text-muted-foreground">還沒有任何歌單</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {playlists.map((playlist, index) => (
        <Link 
          key={playlist.id}
          href={`/playlists/${playlist.id}`}
          className={`block group ${index === 0 ? 'sm:col-span-2 lg:col-span-1' : ''}`}
        >
          <Card className="h-full border-border/5 hover:border-primary/20 transition-all duration-300 group-hover:-translate-y-1 bg-card overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-[1.8/1] relative overflow-hidden bg-primary/10">
                {playlist.playlist_tracks.length > 0 ? (
                  <div className="grid grid-cols-2 grid-rows-2 w-full h-full group-hover:scale-105 transition-transform duration-500">
                    {playlist.playlist_tracks.slice(0, 4).map((track, i) => (
                      <div key={i} className="relative overflow-hidden">
                        {track.image ? (
                          <img 
                            src={track.image} 
                            alt={track.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                            <Music className="w-6 h-6 text-primary/40" />
                          </div>
                        )}
                      </div>
                    ))}
                    {/* 填充空位 */}
                    {Array.from({ length: Math.max(0, 4 - playlist.playlist_tracks.length) }).map((_, i) => (
                      <div key={`empty-${i}`} className="relative overflow-hidden">
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                          <Music className="w-6 h-6 text-primary/40" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                    <Music className="w-12 h-12 text-primary/40" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
              </div>
              <div className="p-6 relative">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold truncate text-foreground group-hover:text-primary transition-colors">
                    {playlist.name}
                  </h3>
                  <span className="flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full text-primary text-xs border border-primary/20">
                    {playlist.playlist_tracks?.length || 0} 首歌曲
                  </span>
                </div>
                {playlist.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 group-hover:text-muted-foreground/80 transition-colors">
                    {playlist.description}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground group-hover:text-primary/80 transition-colors">
                    by {playlist.profiles.username || '匿名用戶'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
      )}
    </div>
  )
}

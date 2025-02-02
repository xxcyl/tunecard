'use client'

import Link from "next/link"
import { Music, ChevronLeft, ChevronRight } from "lucide-react"
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
  if (!playlists || playlists.length === 0) {
    return (
      <div className="text-center py-12">
        <Music className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600">還沒有任何播放列表</p>
      </div>
    )
  }

  return (
    <div className="relative group">
      <button
        onClick={() => {
          const container = document.getElementById('playlist-scroll')
          if (container) {
            container.scrollLeft -= 300
          }
        }}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center transition-colors z-10"
      >
        <ChevronLeft className="w-5 h-5 text-gray-600" />
      </button>
      <button
        onClick={() => {
          const container = document.getElementById('playlist-scroll')
          if (container) {
            container.scrollLeft += 300
          }
        }}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center transition-colors z-10"
      >
        <ChevronRight className="w-5 h-5 text-gray-600" />
      </button>
      <div id="playlist-scroll" className="overflow-x-auto scrollbar-hide flex space-x-4 pb-4 snap-x snap-mandatory touch-pan-x scroll-smooth">
        {playlists.map((playlist) => (
          <div key={playlist.id} className="flex-none w-[300px] snap-start">
            <Link 
              href={`/playlists/${playlist.id}`}
              className="block group"
            >
              <Card className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                <CardContent className="p-6 bg-gradient-to-br from-white to-purple-50">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden">
                      {playlist.playlist_tracks[0]?.image ? (
                        <img 
                          src={playlist.playlist_tracks[0].image} 
                          alt="Album cover" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-purple-100 flex items-center justify-center">
                          <Music className="w-6 h-6 text-purple-600" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold truncate flex-1">
                      {playlist.name}
                    </h3>
                  </div>
                  {playlist.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {playlist.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      {playlist.playlist_tracks?.length || 0} 首歌曲
                    </span>
                    <span>
                      by {playlist.profiles.username || '匿名用戶'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

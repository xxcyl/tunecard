'use client'

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
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
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollInterval = useRef<NodeJS.Timeout>()
  const [isScrolling, setIsScrolling] = useState(false)
  const [duplicatedPlaylists, setDuplicatedPlaylists] = useState<Playlist[]>([])

  // 初始化重複的播放列表
  useEffect(() => {
    if (!playlists || playlists.length === 0) return
    // 在列表末尾添加一整組列表來實現無縫循環
    setDuplicatedPlaylists([...playlists, ...playlists])
  }, [playlists])

  useEffect(() => {
    if (!playlists || playlists.length <= 3) return

    // 自動滾動
    const startAutoScroll = () => {
      scrollInterval.current = setInterval(() => {
        if (scrollRef.current && !isScrolling) {
          const container = scrollRef.current
          const totalWidth = container.scrollWidth / 2
          const currentPosition = container.scrollLeft
          const viewportWidth = container.offsetWidth

          // 當滾動到第二組的開始位置時
          if (currentPosition >= totalWidth) {
            container.scrollLeft = 0
            container.scrollLeft += currentPosition - totalWidth
          }

          container.scrollLeft += 300
        }
      }, 5000)
    }

    startAutoScroll()

    return () => {
      if (scrollInterval.current) {
        clearInterval(scrollInterval.current)
      }
    }
  }, [playlists, isScrolling])

  if (!playlists || playlists.length === 0) {
    return (
      <div className="text-center py-12">
        <Music className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600">還沒有任何播放列表</p>
      </div>
    )
  }

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const container = scrollRef.current
      const scrollAmount = direction === 'left' ? -300 : 300
      
      const totalWidth = container.scrollWidth / 2
      const currentPosition = container.scrollLeft

      if (direction === 'left') {
        if (currentPosition <= 0) {
          // 如果在最開始，跳到第二組的對應位置
          container.scrollLeft = totalWidth
        }
        container.scrollLeft += scrollAmount
      } else {
        if (currentPosition >= totalWidth) {
          // 如果在第二組，跳回第一組的對應位置
          container.scrollLeft = 0
          container.scrollLeft += currentPosition - totalWidth
        }
        container.scrollLeft += scrollAmount
      }
    }
  }

  const handleMouseEnter = () => {
    if (scrollInterval.current) {
      clearInterval(scrollInterval.current)
    }
  }

  const handleMouseLeave = () => {
    if (playlists.length > 3) {
      scrollInterval.current = setInterval(() => {
        if (scrollRef.current && !isScrolling) {
          const container = scrollRef.current
          const isNearEnd = container.scrollLeft + container.offsetWidth >= container.scrollWidth - 600

          if (isNearEnd) {
            setIsScrolling(true)
            setTimeout(() => {
              container.style.scrollBehavior = 'auto'
              container.scrollLeft = 0
              setTimeout(() => {
                container.style.scrollBehavior = 'smooth'
                setIsScrolling(false)
              }, 50)
            }, 300)
          } else {
            container.scrollLeft += 300
          }
        }
      }, 5000)
    }
  }

  return (
    <div 
      className="relative group" 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={() => handleScroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center transition-colors z-10 opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft className="w-5 h-5 text-gray-600" />
      </button>
      <button
        onClick={() => handleScroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center transition-colors z-10 opacity-0 group-hover:opacity-100"
      >
        <ChevronRight className="w-5 h-5 text-gray-600" />
      </button>
      <div 
        ref={scrollRef}
        className="overflow-x-auto scrollbar-hide flex space-x-8 px-8 pb-4 snap-x snap-mandatory touch-pan-x scroll-smooth"
        style={{ scrollSnapAlign: 'center' }}
      >
        {duplicatedPlaylists.map((playlist) => (
          <div key={playlist.id} className="flex-none w-[300px] snap-center">
            <Link 
              href={`/playlists/${playlist.id}`}
              className="block group"
            >
              <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 h-[180px] bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6 h-full flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-purple-100 to-purple-50 ring-2 ring-purple-100">
                      {playlist.playlist_tracks[0]?.image ? (
                        <img 
                          src={playlist.playlist_tracks[0].image} 
                          alt="Album cover" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="w-6 h-6 text-purple-600" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold truncate flex-1 text-gray-800">
                      {playlist.name}
                    </h3>
                  </div>
                  <div className="flex-1">
                    <blockquote className="text-sm text-gray-600 border-l-2 border-purple-300 pl-3 italic line-clamp-2 mb-4">
                      {playlist.description || '暂無簡介'}
                    </blockquote>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
                    <span className="flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded-full text-purple-700">
                      {playlist.playlist_tracks?.length || 0} 首歌曲
                    </span>
                    <span className="font-medium">
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

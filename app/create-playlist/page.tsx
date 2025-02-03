'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, Music } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import { toast } from 'sonner'

interface Track {
  id: string
  title: string
  artist: string
  album?: string | null
  duration?: number | null
  youtube_link?: string | null
  lastfm_link?: string | null
  image?: string | null
}

interface SearchResult {
  id?: string
  title: string
  artist: string
  album?: string | null
  duration?: number | null
  image: string | null
  lastfm_link?: string | null
  youtube_link?: string | null
}

export default function CreatePlaylist() {
  const [playlistName, setPlaylistName] = useState('')
  const [description, setDescription] = useState('')
  const [tracks, setTracks] = useState<Track[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const debouncedSearch = useDebounce(searchQuery, 300)

  const searchTracks = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      console.log('Search results:', data)  // 檢查搜索結果
      console.log('First track lastfm_url:', data[0]?.lastfm_url)  // 檢查第一首歌曲的 Last.fm URL
      setSearchResults(data)
    } catch (error) {
      console.error('Error searching tracks:', error)
      toast.error('搜尋失敗')
    } finally {
      setSearching(false)
    }
  }

  useEffect(() => {
    if (debouncedSearch) {
      searchTracks(debouncedSearch)
    } else {
      setSearchResults([])
    }
  }, [debouncedSearch])

  const addTrack = async (track: SearchResult) => {
    if (tracks.length >= 10) {
      toast.error('最多只能新增 10 首歌曲')
      return
    }

    try {
      // 當選擇歌曲時，呼叫 youtube-link API 獲取影片連結
      let youtubeLink = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${track.title} ${track.artist} official music video`)}`
      
      try {
        const response = await fetch(
          `/api/youtube-link?title=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(track.artist)}`
        )
        const data = await response.json()
        if (data.url) {
          youtubeLink = data.url
        }
      } catch (error) {
        console.error('Error fetching YouTube link:', error)
        // 使用預設的搜尋連結
      }

      // 確保所有必要的屬性都被正確設置
      console.log('Track data before conversion:', {
        ...track,
        lastfm_link: track.lastfm_link
      })  // 檢查轉換前的數據
      console.log('YouTube link:', youtubeLink)  // 檢查 YouTube 連結

      const newTrack: Track = {
        id: `temp-${Date.now()}`,
        title: track.title,
        artist: track.artist,
        album: track.album || null,
        duration: track.duration || null,
        image: track.image || null,
        youtube_link: youtubeLink,
        lastfm_link: track.lastfm_link || null
      }

      console.log('New track after conversion:', {
        ...newTrack,
        has_youtube: typeof newTrack.youtube_link === 'string' && newTrack.youtube_link.length > 0,
        has_lastfm: typeof newTrack.lastfm_link === 'string' && newTrack.lastfm_link.length > 0,
        youtube_link: newTrack.youtube_link,
        lastfm_link: newTrack.lastfm_link
      })  // 檢查轉換後的數據

      // 檢查是否成功獲取所有連結
      console.log('Adding new track:', {
        ...newTrack,
        has_youtube: !!newTrack.youtube_link,
        has_lastfm: !!newTrack.lastfm_link
      })

      setTracks([...tracks, newTrack])
      setSearchQuery('')
      setSearchResults([])
      toast.success('已新增歌曲')
    } catch (error) {
      console.error('Error fetching YouTube link:', error)
      toast.error('無法獲取 YouTube 連結')
    }
  }

  const removeTrack = (id: string) => {
    setTracks(tracks.filter(track => track.id !== id))
  }

  const savePlaylist = async () => {
    if (!playlistName.trim()) {
      toast.error('請輸入播放列表名稱')
      return
    }

    if (tracks.length === 0) {
      toast.error('請至少添加一首歌曲')
      return
    }

    try {
      setSaving(true)
      const response = await fetch('/api/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: playlistName.trim(),
          description: description.trim(),
          tracks: tracks.map((track, index) => {
            // 確保所有屬性都正確設置
            const mappedTrack = {
              title: track.title,
              artist: track.artist,
              album: track.album || null,
              duration: track.duration || null,
              image: track.image || null,
              youtube_link: track.youtube_link || null,
              lastfm_link: track.lastfm_link || null,
              position: index + 1,
              has_youtube: typeof track.youtube_link === 'string' && track.youtube_link.length > 0,
              has_lastfm: typeof track.lastfm_link === 'string' && track.lastfm_link.length > 0
            }
            console.log(`Track ${index + 1} being saved:`, mappedTrack)
            return mappedTrack
          }),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Server error:', data)
        throw new Error(data.error || '保存失敗')
      }

      toast.success('播放列表已保存')
      router.push(`/playlists/${data.id}`)
    } catch (error) {
      console.error('Error saving playlist:', error)
      toast.error(error instanceof Error ? error.message : '保存失敗')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">創建 TuneCard</h1>
          <p className="text-gray-600 mb-8">精選10首你最喜歡的歌曲，分享你的音樂故事。</p>
          
          <div className="mb-8">
            <Input
              type="text"
              placeholder="播放列表名稱"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              className="mb-4 text-xl"
            />
            <Input
              type="text"
              placeholder="播放列表簡介"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-base"
            />
          </div>

          <div className="space-y-8">
            {tracks.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">已添加的歌曲</h2>
                <div className="space-y-2">
                  {tracks.map((track, index) => (
                    <Card key={track.id} className="bg-white">
                      <CardContent className="flex items-center p-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {track.image ? (
                            <img
                              src={track.image}
                              alt={track.title}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                              <Music className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate">{track.title}</div>
                            <div className="text-sm text-gray-500 truncate">
                              {track.artist}
                              {track.album && ` • ${track.album}`}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              {track.youtube_link && (
                                <a
                                  href={track.youtube_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-red-500 hover:text-red-600"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  YouTube
                                </a>
                              )}
                              {track.lastfm_link && (
                                <a
                                  href={track.lastfm_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:text-blue-600"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Last.fm
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-red-500"
                          onClick={() => removeTrack(track.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <h2 className="text-lg font-medium mb-4">新增歌曲</h2>
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="搜尋歌曲..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searching && (
                  <div className="text-center py-4">
                    <span className="text-gray-500">搜尋中...</span>
                  </div>
                )}
                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    {searchResults.map((track, index) => (
                      <Card
                        key={`${track.title}-${track.artist}-${index}`}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => addTrack(track)}
                      >
                        <CardContent className="flex items-center p-4">
                          {track.image ? (
                            <img
                              src={track.image}
                              alt={track.title}
                              className="w-12 h-12 object-cover rounded mr-4"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded mr-4 flex items-center justify-center">
                              <Music className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="font-medium">{track.title}</div>
                            <div className="text-sm text-gray-500">
                              {track.artist}
                              {track.album && ` • ${track.album}`}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => router.push('/')}
              >
                取消
              </Button>
              <Button
                onClick={savePlaylist}
                disabled={saving}
              >
                {saving ? '儲存中...' : '儲存播放列表'}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, GripVertical, Music2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { DragDropContext, Droppable, Draggable, OnDragEndResponder, DropResult } from '@hello-pangea/dnd'

interface Track {
  id: string
  title: string
  artist: string
  album?: string | null
  duration?: number | null
  image?: string | null
  youtube_link?: string | null
  lastfm_link?: string | null
  position: number
}

interface SearchResult {
  id?: string
  title: string
  artist: string
  album?: string | null
  duration?: number | null
  image: string | null
  youtube_link?: string | null
  lastfm_link?: string | null
}

interface Playlist {
  id: string
  name: string
  user_id: string
  playlist_tracks: Track[]
}

export default function EditPlaylist({ params }: { params: { id: string } }) {
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [playlistName, setPlaylistName] = useState('')
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchPlaylist()
  }, [])

  const fetchPlaylist = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      const { data: playlist, error } = await supabase
        .from('playlists')
        .select('*, playlist_tracks(*)')
        .eq('id', params.id)
        .single()

      if (error) throw error

      if (playlist.user_id !== session.user.id) {
        toast.error('你沒有權限編輯這個播放列表')
        router.push('/')
        return
      }

      setPlaylist(playlist)
      setPlaylistName(playlist.name)
      setTracks(playlist.playlist_tracks.sort((a: Track, b: Track) => a.position - b.position))
    } catch (error) {
      console.error('Error fetching playlist:', error)
      toast.error('無法載入播放列表')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)

  const searchTracks = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error('Error searching tracks:', error)
      toast.error('搜尋失敗')
    } finally {
      setSearching(false)
    }
  }

  const addTrack = (track: SearchResult) => {
    if (tracks.length >= 10) {
      toast.error('最多只能新增 10 首歌曲')
      return
    }
    const newTrack: Track = {
      id: `temp-${Date.now()}`,
      title: track.title,
      artist: track.artist,
      album: track.album || null,
      duration: track.duration || null,
      image: track.image || null,
      youtube_link: track.youtube_link || null,
      lastfm_link: track.lastfm_link || null,
      position: tracks.length + 1
    }
    setTracks([...tracks, newTrack])
    setSearchQuery('')
    setSearchResults([])
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

      // 更新播放列表名稱
      const { error: nameError } = await supabase
        .from('playlists')
        .update({ name: playlistName.trim() })
        .eq('id', params.id)

      if (nameError) throw nameError

      // 刪除所有現有的歌曲
      const { error: deleteError } = await supabase
        .from('playlist_tracks')
        .delete()
        .eq('playlist_id', params.id)

      if (deleteError) throw deleteError

      // 添加更新後的歌曲
      const { error: tracksError } = await supabase
        .from('playlist_tracks')
        .insert(
          tracks.map((track: Track, index: number) => ({
            playlist_id: params.id,
            title: track.title,
            artist: track.artist,
            album: track.album || null,
            duration: track.duration || null,
            image: track.image || null,
            youtube_link: track.youtube_link || null,
            lastfm_link: track.lastfm_link || null,
            position: index + 1
          }))
        )

      if (tracksError) throw tracksError

      toast.success('播放列表已更新')
      router.push(`/playlists/${params.id}`)
    } catch (error) {
      console.error('Error updating playlist:', error)
      toast.error('更新失敗')
    } finally {
      setSaving(false)
    }
  }

  const removeTrack = (index: number) => {
    setTracks(tracks.filter((_, i) => i !== index))
  }

  const onDragEnd: OnDragEndResponder = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(tracks)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setTracks(items)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="text-center">載入中...</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">編輯 TuneCard</h1>
          <p className="text-gray-600 mb-8">精選10首你最喜歡的歌曲，分享你的音樂故事。</p>
          
          <div className="mb-8">
            <Input
              type="text"
              placeholder="播放列表名稱"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              className="text-xl"
            />
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="tracks">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {tracks.map((track, index) => (
                    <Draggable
                      key={track.id || index}
                      draggableId={track.id || index.toString()}
                      index={index}
                    >
                      {(provided) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                        >
                          <CardContent className="flex items-center p-4">
                            <div
                              {...provided.dragHandleProps}
                              className="mr-4 cursor-move"
                            >
                              <GripVertical className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{track.title}</div>
                              <div className="text-sm text-gray-500">
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
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTrack(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <div className="mt-8 space-y-4">
            <div className="border-t pt-4">
              <h2 className="text-lg font-medium mb-4">新增歌曲</h2>
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="搜尋歌曲..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    searchTracks(e.target.value)
                  }}
                />
                {searching && (
                  <div className="text-center py-4">
                    <span className="text-gray-500">搜尋中...</span>
                  </div>
                )}
                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    {searchResults.map((track) => (
                      <Card key={track.id} className="cursor-pointer hover:bg-gray-50" onClick={() => addTrack(track)}>
                        <CardContent className="flex items-center p-4">
                          {track.image ? (
                            <img
                              src={track.image}
                              alt={track.title}
                              className="w-12 h-12 object-cover rounded mr-4"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded mr-4 flex items-center justify-center">
                              <Music2 className="w-6 h-6 text-gray-400" />
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
                onClick={() => router.push(`/playlists/${params.id}`)}
              >
                取消
              </Button>
              <Button
                onClick={savePlaylist}
                disabled={saving}
              >
                {saving ? '儲存中...' : '儲存變更'}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

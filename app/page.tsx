import Link from "next/link"
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { Header } from "../components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Music, Share2, Headphones, Plus, Youtube, ExternalLink } from "lucide-react"

async function getPlaylists() {
  try {
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

    const { data: playlists, error: playlistError } = await supabase
      .from('playlists')
      .select(`
        *,
        profiles:user_id(username, avatar_url),
        playlist_tracks(count)
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    if (playlistError) {
      console.error('Error fetching playlists:', playlistError)
      return []
    }

    console.log('Fetched playlists:', playlists)
    return playlists || []
  } catch (error) {
    console.error('Unexpected error:', error)
    return []
  }
}

export default async function Home() {
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
  const playlists = await getPlaylists()
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 text-gray-900">TuneCard</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            精選10首你最喜歡的歌曲，與世界分享你的音樂故事。
          </p>
          <div className="space-y-4">
            {isLoggedIn ? (
              <Button asChild size="lg" className="bg-purple-600 text-white hover:bg-purple-700">
                <Link href="/create-playlist" className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  創建音樂名片
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="bg-purple-600 text-white hover:bg-purple-700">
                <Link href="/login" className="flex items-center gap-2">
                  登入以創建音樂名片
                </Link>
              </Button>
            )}
            {!isLoggedIn && (
              <p className="text-sm text-gray-500">
                所有音樂名片皆可自由瀏覽，登入後即可創建自己的音樂名片
              </p>
            )}
          </div>
        </section>

        <section className="max-w-4xl mx-auto mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Music,
                title: "智能搜尋",
                description: "使用 Last.fm API 快速找到歌曲、專輯和歌手信息。",
              },
              {
                icon: Share2,
                title: "詳細資訊",
                description: "查看歌曲的詳細信息，包括 Last.fm 介紹和 YouTube 官方影片。",
              },
              {
                icon: Headphones,
                title: "直接連結",
                description: "一鍵快速跳轉到 YouTube 觀看音樂影片或 Last.fm 查看更多資訊。",
              },
            ].map((feature, index) => (
              <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-gray-900">
                    <feature.icon className="mr-2 w-5 h-5 text-purple-600" />
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">最新播放列表</h2>
          {(!playlists || playlists.length === 0) ? (
            <div className="text-center py-12">
              <Music className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">還沒有任何播放列表</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {playlists.map((playlist) => (
                <Link 
                  key={playlist.id}
                  href={`/playlists/${playlist.id}`}
                  className="block group"
                >
                  <Card className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                    <CardContent className="p-6 bg-gradient-to-br from-white to-purple-50">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold truncate flex-1">
                          {playlist.name}
                        </h3>
                        <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full">
                          <Music className="w-4 h-4 text-purple-600" />
                        </div>
                      </div>
                      {playlist.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                          {playlist.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Headphones className="w-4 h-4" />
                          {playlist.playlist_tracks.length} 首歌曲
                        </span>
                        <span>
                          by {playlist.profiles.username || '匿名用戶'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}


import Link from "next/link"
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { Header } from "../components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Music, Share2, Headphones, Plus } from "lucide-react"
import { LatestPlaylists } from "@/components/latest-playlists"

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
        playlist_tracks (*)
      `)
      .order('created_at', { ascending: false })
      .limit(9)

    if (playlistError) {
      console.error('Error fetching playlists:', playlistError)
      return []
    }

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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-8 sm:pt-24 sm:pb-12 bg-gradient-to-b from-purple-100/50 via-purple-50/20 to-white">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
          </div>
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl sm:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-purple-400">
                TuneCard
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                挑選你喜愛的歌曲，與世界分享你的音樂故事。
              </p>
              <div className="space-y-4 mb-12">
                {isLoggedIn ? (
                  <Button 
                    asChild 
                    size="lg" 
                    className="bg-purple-600 hover:bg-purple-700 shadow-lg hover:shadow-purple-200/50 transition-all duration-300"
                  >
                    <Link href="/create-playlist" className="flex items-center gap-2 px-8">
                      <Plus className="w-5 h-5" />
                      創建音樂名片
                    </Link>
                  </Button>
                ) : (
                  <Button 
                    asChild 
                    size="lg" 
                    className="bg-purple-600 hover:bg-purple-700 shadow-lg hover:shadow-purple-200/50 transition-all duration-300"
                  >
                    <Link href="/login" className="flex items-center gap-2 px-8">
                      登入以創建音樂名片
                    </Link>
                  </Button>
                )}
                {!isLoggedIn && (
                  <p className="text-sm text-gray-500 animate-fade-in">
                    所有音樂名片皆可自由瀏覽，登入後即可創建自己的音樂名片
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 mb-16">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    icon: Music,
                    title: "快速搜尋",
                    description: "使用 Last.fm API 快速找到歌曲、專輯和歌手資訊。",
                  },
                  {
                    icon: Share2,
                    title: "詳細資訊",
                    description: "查看歌曲的詳細資訊，包括 Last.fm 介紹和 YouTube 官方影片。",
                  },
                  {
                    icon: Headphones,
                    title: "直接連結",
                    description: "一鍵快速跳轉到 YouTube 觀看音樂影片或 Last.fm 查看更多資訊。",
                  },
                ].map((feature, index) => (
                  <Card 
                    key={index} 
                    className="group bg-white/50 border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden relative"
                  >
                    <CardHeader>
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mb-4">
                        <feature.icon className="w-6 h-6 text-purple-600" />
                      </div>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="bg-gradient-to-br from-purple-100/90 to-purple-50/90 backdrop-blur-sm shadow-xl rounded-3xl py-8 border border-purple-200/50">
                <LatestPlaylists playlists={playlists} />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}


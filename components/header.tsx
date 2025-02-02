'use client'

import Link from "next/link"
import { LogOut, Music } from "lucide-react"
import { Button } from "./ui/button"
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'

export function Header() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()



  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        if (event === 'SIGNED_OUT') {
          router.refresh()
          router.push('/')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2">
            <Music className="h-6 w-6" />
            <span className="text-xl font-bold">TuneCard</span>
          </Link>
          <nav className="flex items-center space-x-4">
            {user && (
              <>
                <Link 
                  href="/create-playlist" 
                  className="text-primary hover:text-primary/80"
                >
                  創建 TuneCard
                </Link>
                <Link 
                  href={`/my-playlists`}
                  className="text-primary hover:text-primary/80"
                >
                  我的 TuneCard
                </Link>
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <Button
              variant="ghost"
              onClick={() => signOut()}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>登出</span>
            </Button>
          ) : (
            <Link href="/login">
              <Button variant="ghost">
                登入
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}


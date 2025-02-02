import type { Metadata } from 'next'
import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from './providers'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  adjustFontFallback: false
})

export const metadata: Metadata = {
  title: 'MusicHub - 創建和分享你的播放列表',
  description: '一個簡單、直觀的音樂播放列表分享平台。搜索歌曲、創建播放列表，並與他人分享你的音樂品味。',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-TW">
      <body className={`${inter.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

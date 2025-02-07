import type { Metadata } from 'next'
import './globals.css'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { Providers } from './providers'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  adjustFontFallback: false
})

export const metadata: Metadata = {
  title: 'TuneCard - 分享你的音樂故事',
  description: '創建精美的音樂卡片，分享你最愛的歌曲和播放列表。讓音樂連結彼此，訴說你的故事。',
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
        <Analytics />
      </body>
    </html>
  )
}

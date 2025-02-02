import { NextResponse } from 'next/server'

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title')
  const artist = searchParams.get('artist')

  if (!title || !artist) {
    return NextResponse.json(
      { error: 'Title and artist parameters are required' },
      { status: 400 }
    )
  }

  // 如果沒有 API key，返回搜索連結
  if (!YOUTUBE_API_KEY) {
    return NextResponse.json({
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} ${artist} official music video`)}`
    })
  }

  try {
    const youtubeSearchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=1&q=${encodeURIComponent(`${title} ${artist} official music video`)}&key=${YOUTUBE_API_KEY}`
    const youtubeResponse = await fetch(youtubeSearchUrl)
    const youtubeData = await youtubeResponse.json()

    const videoId = youtubeData.items?.[0]?.id?.videoId
    const url = videoId 
      ? `https://www.youtube.com/watch?v=${videoId}`
      : `https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} ${artist} official music video`)}`

    return NextResponse.json({ url })
  } catch (error) {
    console.error('YouTube API error:', error)
    return NextResponse.json({
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} ${artist} official music video`)}`
    })
  }
}

import { NextResponse } from 'next/server'

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
  }

  if (!YOUTUBE_API_KEY) {
    console.error('YouTube API key is not configured')
    return NextResponse.json({ error: 'API key is not configured' }, { status: 500 })
  }

  try {
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}&type=video&maxResults=1`
    const response = await fetch(searchUrl)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || `YouTube API error: ${response.status}`)
    }

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ url: null })
    }

    const videoId = data.items[0].id.videoId
    const url = `https://www.youtube.com/watch?v=${videoId}`

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Error searching YouTube:', error)
    return NextResponse.json(
      { error: 'Failed to search YouTube', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

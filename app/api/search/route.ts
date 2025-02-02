import { NextResponse } from 'next/server'

const LASTFM_API_KEY = process.env.LASTFM_API_KEY || '3566d6ff56588bed0523e0f83482ffc3'
const LASTFM_API_URL = 'http://ws.audioscrobbler.com/2.0/'
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
  }

  if (!LASTFM_API_KEY) {
    console.error('Last.fm API key is not configured')
    return NextResponse.json({ error: 'API key is not configured' }, { status: 500 })
  }

  try {
    // 搜索 API - 只要求基本信息
    const searchUrl = `${LASTFM_API_URL}?method=track.search&track=${encodeURIComponent(query)}&api_key=${LASTFM_API_KEY}&format=json&limit=5`
    const searchResponse = await fetch(searchUrl)
    const searchData = await searchResponse.json()

    if (!searchResponse.ok || searchData.error) {
      throw new Error(searchData.message || `Last.fm API error: ${searchResponse.status}`)
    }

    const tracks = searchData.results?.trackmatches?.track || []
    const trackDetailsPromises = tracks.map(async (track: any) => {
      try {
        // 獲取歌曲詳細信息
        const infoUrl = `${LASTFM_API_URL}?method=track.getInfo&track=${encodeURIComponent(track.name)}&artist=${encodeURIComponent(track.artist)}&api_key=${LASTFM_API_KEY}&format=json`
        const infoResponse = await fetch(infoUrl)
        const infoData = await infoResponse.json()

        // 設置 YouTube 連結
        let youtubeLink = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${track.name} ${track.artist} official music video`)}`

        // 如果有 YouTube API Key，嘗試找到精確的影片
        if (YOUTUBE_API_KEY) {
          try {
            const youtubeSearchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=1&q=${encodeURIComponent(`${track.name} ${track.artist} official music video`)}&key=${YOUTUBE_API_KEY}`
            const youtubeResponse = await fetch(youtubeSearchUrl)
            const youtubeData = await youtubeResponse.json()

            if (youtubeData.items?.[0]?.id?.videoId) {
              youtubeLink = `https://www.youtube.com/watch?v=${youtubeData.items[0].id.videoId}`
            }
          } catch (error) {
            console.error('YouTube API Error:', error)
            // 繼續使用搜索連結
          }
        }

        return {
          id: track.mbid || `${track.name}-${track.artist}`,
          title: track.name,
          artist: track.artist,
          album: infoData.track?.album?.title || '',
          image: infoData.track?.album?.image?.[3]?.['#text'] || track.image?.[2]?.['#text'] || null,
          youtube_link: youtubeLink,
          lastfm_link: infoData.track?.url || `https://www.last.fm/music/${encodeURIComponent(track.artist)}/_/${encodeURIComponent(track.name)}`,
          duration: infoData.track?.duration ? Math.round(Number(infoData.track.duration) / 1000) : null
        }
      } catch (error) {
        console.error('Error getting track details:', error)
        // 如果獲取詳細信息失敗，返回基本信息
        return {
          id: `${track.name}-${track.artist}`,
          title: track.name,
          artist: track.artist,
          album: '',
          image: track.image?.[2]?.['#text'] || null,
          youtube_link: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${track.name} ${track.artist} official music video`)}`,
          lastfm_link: `https://www.last.fm/music/${encodeURIComponent(track.artist)}/_/${encodeURIComponent(track.name)}`,
          duration: null
        }
      }
    })

    const formattedTracks = await Promise.all(trackDetailsPromises)
    return NextResponse.json(formattedTracks)

  } catch (error: any) {
    console.error('Error searching tracks:', error)
    return NextResponse.json(
      { error: 'Failed to search tracks', details: error.message },
      { status: 500 }
    )
  }
}

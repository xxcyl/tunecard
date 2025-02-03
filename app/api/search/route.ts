import { NextResponse } from 'next/server'

const LASTFM_API_KEY = process.env.LASTFM_API_KEY
const LASTFM_API_URL = 'http://ws.audioscrobbler.com/2.0/'

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

        // 處理圖片：優先使用專輯圖片，如果沒有則使用歌曲圖片
        const albumImage = infoData.track?.album?.image?.[2]?.['#text']
        const trackImage = track.image?.[2]?.['#text']
        
        // 確保我們有 Last.fm URL
        const lastfmUrl = track.url || null
        console.log('Track info:', {
          name: track.name,
          lastfm_link: lastfmUrl,
          track_url: track.url,
          info_url: infoData.track?.url
        })

        return {
          id: track.mbid || `${track.name}-${track.artist}`,
          title: track.name,
          artist: track.artist,
          duration: infoData.track?.duration ? Math.floor(parseInt(infoData.track.duration) / 1000) : null,
          album: infoData.track?.album?.title || null,
          image: albumImage || trackImage || null,
          lastfm_link: lastfmUrl
        }
      } catch (error) {
        console.error('Error fetching track info:', error)
        // 如果獲取詳細信息失敗，返回基本信息
        // 如果獲取詳細信息失敗，返回基本信息
        const lastfmUrl = track.url || null
        console.log('Track basic info:', {
          name: track.name,
          lastfm_link: lastfmUrl,
          track_url: track.url
        })

        return {
          id: track.mbid || `${track.name}-${track.artist}`,
          title: track.name,
          artist: track.artist,
          image: track.image?.[2]?.['#text'] || null,
          lastfm_link: lastfmUrl
        }
      }
    })

    const trackDetails = await Promise.all(trackDetailsPromises)
    return NextResponse.json(trackDetails)
  } catch (error) {
    console.error('Error searching tracks:', error)
    return NextResponse.json(
      { error: 'Failed to search tracks', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

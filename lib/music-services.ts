// MusicKit JS will be loaded via script tag in the frontend
declare global {
  interface Window {
    MusicKit: any;
  }
}

// Initialize MusicKit
const initializeMusicKit = async () => {
  if (typeof window === 'undefined') return null;
  
  await window.MusicKit.configure({
    developerToken: process.env.NEXT_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN,
    app: {
      name: 'Playlist Sharing',
      build: '1.0.0'
    }
  });
  
  return window.MusicKit.getInstance();
}

export async function importAppleMusicPlaylist(playlistUrl: string) {
  if (typeof window === 'undefined') {
    throw new Error('This function must be called from the client side');
  }

  // 從 URL 中提取 playlist ID
  const playlistId = playlistUrl.split('/').pop();
  if (!playlistId) throw new Error('Invalid playlist URL');

  const music = await initializeMusicKit();
  if (!music) throw new Error('Failed to initialize MusicKit');

  try {
    const data = await music.api.playlist(playlistId);

    return {
      title: data.attributes.name,
      creator: data.attributes.curatorName,
      platform: 'Apple Music',
      tracks: data.relationships.tracks.data.map((track: any) => ({
        title: track.attributes.name,
        artist: track.attributes.artistName,
        album: track.attributes.albumName,
        duration: msToMinutesAndSeconds(track.attributes.durationInMillis),
        youtubeLink: getYouTubeMusicLink(track.attributes.name, track.attributes.artistName),
      })),
    };
  } catch (error) {
    console.error('Error fetching playlist:', error);
    throw new Error('Failed to fetch playlist from Apple Music');
  }
}

function msToMinutesAndSeconds(ms: number) {
  const minutes = Math.floor(ms / 60000)
  const seconds = ((ms % 60000) / 1000).toFixed(0)
  return `${minutes}:${Number.parseInt(seconds) < 10 ? "0" : ""}${seconds}`
}

function getYouTubeMusicLink(title: string, artist: string) {
  // 這個函數應該實現搜索 YouTube Music 並返回第一個結果的鏈接
  // 你可能需要使用 YouTube Data API 或其他第三方服務來實現這個功能
  return `https://music.youtube.com/search?q=${encodeURIComponent(`${title} ${artist}`)}`
}


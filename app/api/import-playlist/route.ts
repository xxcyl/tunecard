import { NextResponse } from "next/server"
import { importAppleMusicPlaylist } from "@/lib/music-services"
import { savePlaylistToDatabase } from "@/lib/database"

export async function POST(request: Request) {
  const { playlistUrl } = await request.json()

  try {
    const playlistData = await importAppleMusicPlaylist(playlistUrl)

    // 將歌單數據保存到數據庫
    const savedPlaylist = await savePlaylistToDatabase(playlistData)

    return NextResponse.json({
      playlistId: savedPlaylist.id,
      trackCount: playlistData.tracks.length,
    })
  } catch (error) {
    console.error("Error importing playlist:", error)
    return NextResponse.json({ error: "Failed to import playlist" }, { status: 500 })
  }
}


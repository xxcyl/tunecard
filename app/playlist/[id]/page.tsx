"use client"

import { Header } from "../../../components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Music } from "lucide-react"
import { useState, useEffect } from "react"

async function getPlaylist(id: string) {
  // 這裡應該是一個實際的API調用
  return {
    id,
    title: "Acoustic Serenity",
    creator: "John Doe",
    tracks: [
      {
        title: "Peaceful Strings",
        artist: "Melody Maker",
        album: "Calm Reflections",
        duration: "3:45",
        youtubeLink: "https://music.youtube.com/watch?v=dQw4w9WgXcQ",
      },
      {
        title: "Gentle Whispers",
        artist: "Harmony Heights",
        album: "Soothing Sounds",
        duration: "4:12",
        youtubeLink: "https://music.youtube.com/watch?v=dQw4w9WgXcQ",
      },
      // 更多歌曲...
    ],
  }
}

export default function PlaylistPage({ params }: { params: { id: string } }) {
  const [currentVideo, setCurrentVideo] = useState<string | null>(null)
  const [playlist, setPlaylist] = useState<Awaited<ReturnType<typeof getPlaylist>> | null>(null)

  useEffect(() => {
    async function fetchPlaylist() {
      const data = await getPlaylist(params.id)
      setPlaylist(data)
    }
    fetchPlaylist()
  }, [params.id])

  return (
    <div className="min-h-screen bg-apple-gray">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-3xl text-gray-900">{playlist?.title}</CardTitle>
            <CardDescription className="text-gray-600">Created by {playlist?.creator}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-2 text-gray-600">#</th>
                    <th className="text-left p-2 text-gray-600">Title</th>
                    <th className="text-left p-2 text-gray-600">Artist</th>
                    <th className="text-left p-2 text-gray-600">Album</th>
                    <th className="text-left p-2 text-gray-600">Duration</th>
                    <th className="text-left p-2 text-gray-600">YouTube Music</th>
                  </tr>
                </thead>
                <tbody>
                  {playlist?.tracks.map((track, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-apple-gray/50 transition-colors">
                      <td className="p-2 text-gray-600">{index + 1}</td>
                      <td className="p-2 text-gray-900">{track.title}</td>
                      <td className="p-2 text-gray-700">{track.artist}</td>
                      <td className="p-2 text-gray-700">{track.album}</td>
                      <td className="p-2 text-gray-700">{track.duration}</td>
                      <td className="p-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-apple-blue hover:text-apple-blue/80 hover:bg-apple-gray/50"
                          onClick={() => setCurrentVideo(track.youtubeLink)}
                        >
                          <Music className="w-4 h-4 mr-2" />
                          Listen
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
          {currentVideo && (
            <CardContent>
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  src={currentVideo.replace('music.youtube.com/watch?v=', 'www.youtube.com/embed/')}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full rounded-lg"
                />
              </div>
            </CardContent>
          )}
        </Card>
      </main>
    </div>
  )
}


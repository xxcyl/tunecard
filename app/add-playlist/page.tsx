"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "../../components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Music } from "lucide-react"

export default function AddPlaylist() {
  const [playlistUrl, setPlaylistUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch("/api/import-playlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ playlistUrl }),
      })

      if (!response.ok) {
        throw new Error("Failed to import playlist")
      }

      const data = await response.json()
      toast({
        title: "Playlist imported successfully",
        description: `Imported ${data.trackCount} tracks from Apple Music`,
      })
      router.push(`/playlist/${data.playlistId}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import playlist. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-apple-gray">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center text-gray-900">
              <Music className="mr-2 w-6 h-6 text-apple-blue" />
              Import Apple Music Playlist
            </CardTitle>
            <CardDescription className="text-gray-600">
              Enter the URL of your Apple Music playlist to import and share it with others.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="url" className="text-gray-700">
                  Apple Music Playlist URL
                </Label>
                <Input
                  id="url"
                  placeholder="https://music.apple.com/us/playlist/your-playlist"
                  value={playlistUrl}
                  onChange={(e) => setPlaylistUrl(e.target.value)}
                  required
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-apple-blue text-white hover:bg-apple-blue/90"
                disabled={isLoading}
              >
                {isLoading ? "Importing..." : "Import Playlist"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}


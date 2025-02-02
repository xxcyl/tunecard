'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function DeletePlaylist({ playlistId }: { playlistId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('確定要刪除這個播放列表嗎？')) {
      return
    }

    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', playlistId)

      if (error) throw error

      toast.success('播放列表已刪除')
      router.push('/my-playlists')
    } catch (error) {
      console.error('Error deleting playlist:', error)
      toast.error('刪除失敗')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  )
}

export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return ''
  
  // 確保是有效的數字
  const totalSeconds = Math.round(Number(seconds))
  if (isNaN(totalSeconds)) return ''
  
  const minutes = Math.floor(totalSeconds / 60)
  const remainingSeconds = totalSeconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

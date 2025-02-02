'use client'

import { AuthProvider } from '@/components/providers/supabase-auth-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}

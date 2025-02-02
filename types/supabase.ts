export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      playlist_tracks: {
        Row: {
          id: string
          playlist_id: string
          title: string
          artist: string
          album: string | null
          duration: number | null
          image: string | null
          youtube_link: string | null
          lastfm_link: string | null
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          playlist_id: string
          title: string
          artist: string
          album?: string | null
          duration?: number | null
          image?: string | null
          youtube_link?: string | null
          lastfm_link?: string | null
          position: number
          created_at?: string
        }
        Update: {
          id?: string
          playlist_id?: string
          title?: string
          artist?: string
          album?: string | null
          duration?: number | null
          image?: string | null
          youtube_link?: string | null
          lastfm_link?: string | null
          position?: number
          created_at?: string
        }
      }
      playlists: {
        Row: {
          id: string
          name: string
          description: string | null
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          user_id?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
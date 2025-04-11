
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      chats: {
        Row: {
          id: string
          created_at: string
          name: string | null
          is_group: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          name?: string | null
          is_group: boolean
        }
        Update: {
          id?: string
          created_at?: string
          name?: string | null
          is_group?: boolean
        }
      }
      chat_participants: {
        Row: {
          chat_id: string
          user_id: string
          joined_at: string
        }
        Insert: {
          chat_id: string
          user_id: string
          joined_at?: string
        }
        Update: {
          chat_id?: string
          user_id?: string
          joined_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          chat_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string | null
          is_edited: boolean
        }
        Insert: {
          id?: string
          chat_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string | null
          is_edited?: boolean
        }
        Update: {
          id?: string
          chat_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string | null
          is_edited?: boolean
        }
      }
      message_read_status: {
        Row: {
          message_id: string
          user_id: string
          read_at: string
        }
        Insert: {
          message_id: string
          user_id: string
          read_at?: string
        }
        Update: {
          message_id?: string
          user_id?: string
          read_at?: string
        }
      }
      message_reactions: {
        Row: {
          message_id: string
          user_id: string
          emoji: string
          created_at: string
        }
        Insert: {
          message_id: string
          user_id: string
          emoji: string
          created_at?: string
        }
        Update: {
          message_id?: string
          user_id?: string
          emoji?: string
          created_at?: string
        }
      }
      files: {
        Row: {
          id: string
          filename: string
          file_type: string
          size: number
          storage_path: string
          user_id: string
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          filename: string
          file_type: string
          size: number
          storage_path: string
          user_id: string
          description: string
          created_at?: string
        }
        Update: {
          id?: string
          filename?: string
          file_type?: string
          size?: number
          storage_path?: string
          user_id?: string
          description?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          username: string
          full_name: string
          status: string
          avatar_url: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          username: string
          full_name: string
          status?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          username?: string
          full_name?: string
          status?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string | null
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
      user_status: 'online' | 'away' | 'offline'
    }
  }
}


export type UserStatus = 'online' | 'away' | 'offline';

export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  status: UserStatus;
  created_at: string;
  avatar_url?: string;
}

export interface Message {
  id: string;
  chat_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  is_edited: boolean;
  read_by: string[];
  reactions?: MessageReaction[];
}

export interface MessageReaction {
  user_id: string;
  emoji: string;
}

export interface Chat {
  id: string;
  name: string | null;
  is_group: boolean;
  created_at: string;
  last_message?: Message;
  participants: ChatParticipant[];
  unread_count?: number;
}

export interface ChatParticipant {
  user_id: string;
  joined_at: string;
  user?: User;
}

export interface FileUpload {
  id: string;
  filename: string;
  file_type: string;
  size: number;
  url: string;
  user_id: string;
  description: string;
  created_at: string;
  uploader?: User;
}

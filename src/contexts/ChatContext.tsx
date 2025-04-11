
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Chat, Message, User } from '@/types';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ChatContextType {
  chats: Chat[];
  activeChat: Chat | null;
  messages: Message[];
  users: User[];
  loadingChats: boolean;
  loadingMessages: boolean;
  setActiveChat: (chat: Chat | null) => void;
  createChat: (participants: string[], name?: string) => Promise<Chat>;
  sendMessage: (content: string) => Promise<void>;
  editMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  addReaction: (messageId: string, emoji: string) => Promise<void>;
  markAsRead: (chatId: string) => Promise<void>;
  searchMessages: (query: string) => Promise<Message[]>;
}

const ChatContext = createContext<ChatContextType>({
  chats: [],
  activeChat: null,
  messages: [],
  users: [],
  loadingChats: true,
  loadingMessages: false,
  setActiveChat: () => {},
  createChat: async () => ({ id: '', name: null, is_group: false, created_at: '', participants: [] }),
  sendMessage: async () => {},
  editMessage: async () => {},
  deleteMessage: async () => {},
  addReaction: async () => {},
  markAsRead: async () => {},
  searchMessages: async () => []
});

export const useChat = () => useContext(ChatContext);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Load mock users
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        email: 'john.doe@example.com',
        username: 'johndoe',
        full_name: 'John Doe',
        status: 'online',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        email: 'jane.smith@example.com',
        username: 'janesmith',
        full_name: 'Jane Smith',
        status: 'away',
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        email: 'dj.jones@example.com',
        username: 'djjones',
        full_name: 'DJ Jones',
        status: 'online',
        created_at: new Date().toISOString()
      }
    ];
    
    setUsers(mockUsers);
  }, []);

  // Load mock chats
  useEffect(() => {
    if (user) {
      const mockChats: Chat[] = [
        {
          id: '1',
          name: null,
          is_group: false,
          created_at: new Date().toISOString(),
          participants: [
            { user_id: user.id, joined_at: new Date().toISOString() },
            { user_id: '1', joined_at: new Date().toISOString() }
          ],
          unread_count: 1
        },
        {
          id: '2',
          name: null,
          is_group: false,
          created_at: new Date().toISOString(),
          participants: [
            { user_id: user.id, joined_at: new Date().toISOString() },
            { user_id: '2', joined_at: new Date().toISOString() }
          ],
          unread_count: 0
        },
        {
          id: '3',
          name: 'Project Team',
          is_group: true,
          created_at: new Date().toISOString(),
          participants: [
            { user_id: user.id, joined_at: new Date().toISOString() },
            { user_id: '1', joined_at: new Date().toISOString() },
            { user_id: '2', joined_at: new Date().toISOString() },
            { user_id: '3', joined_at: new Date().toISOString() }
          ],
          unread_count: 0
        }
      ];

      // Attach user info to each participant
      mockChats.forEach(chat => {
        chat.participants = chat.participants.map(participant => {
          const participantUser = users.find(u => u.id === participant.user_id) || 
                                  (participant.user_id === user.id ? user : undefined);
          return {
            ...participant,
            user: participantUser
          };
        });
      });

      setChats(mockChats);
      setLoadingChats(false);
    }
  }, [user, users]);

  // Load mock messages when active chat changes
  useEffect(() => {
    if (activeChat) {
      setLoadingMessages(true);
      
      // Create mock messages for the active chat
      const now = new Date();
      const mockMessages: Message[] = [
        {
          id: '1',
          chat_id: activeChat.id,
          user_id: activeChat.participants.find(p => p.user_id !== user?.id)?.user_id || '',
          content: 'Hello! How are you doing today?',
          created_at: new Date(now.getTime() - 60 * 60000).toISOString(),
          is_edited: false,
          read_by: [user?.id || '']
        },
        {
          id: '2',
          chat_id: activeChat.id,
          user_id: user?.id || '',
          content: 'Hey there! I\'m doing well, thanks for asking. How about you?',
          created_at: new Date(now.getTime() - 50 * 60000).toISOString(),
          is_edited: false,
          read_by: [user?.id || '', activeChat.participants.find(p => p.user_id !== user?.id)?.user_id || '']
        },
        {
          id: '3',
          chat_id: activeChat.id,
          user_id: activeChat.participants.find(p => p.user_id !== user?.id)?.user_id || '',
          content: 'I\'m great! Been working on that project we discussed last week.',
          created_at: new Date(now.getTime() - 40 * 60000).toISOString(),
          is_edited: true,
          read_by: [user?.id || '']
        },
        {
          id: '4',
          chat_id: activeChat.id,
          user_id: user?.id || '',
          content: 'That sounds interesting! Any progress to share?',
          created_at: new Date(now.getTime() - 30 * 60000).toISOString(),
          is_edited: false,
          read_by: [user?.id || '']
        },
        {
          id: '5',
          chat_id: activeChat.id,
          user_id: activeChat.participants.find(p => p.user_id !== user?.id)?.user_id || '',
          content: 'Yes! I\'ve completed the initial design and would love your feedback.',
          created_at: new Date(now.getTime() - 20 * 60000).toISOString(),
          is_edited: false,
          read_by: []
        }
      ];

      setTimeout(() => {
        setMessages(mockMessages);
        setLoadingMessages(false);
        // Mark chat as read
        if (activeChat.unread_count && activeChat.unread_count > 0) {
          setChats(prevChats => 
            prevChats.map(chat => 
              chat.id === activeChat.id ? { ...chat, unread_count: 0 } : chat
            )
          );
        }
      }, 500);
    } else {
      setMessages([]);
    }
  }, [activeChat, user?.id]);

  const createChat = async (participantIds: string[], name?: string): Promise<Chat> => {
    try {
      // Mock create chat - will be replaced with Supabase
      const newChat: Chat = {
        id: Math.random().toString(36).substring(2, 11),
        name: name || null,
        is_group: participantIds.length > 1,
        created_at: new Date().toISOString(),
        participants: [
          { user_id: user?.id || '', joined_at: new Date().toISOString() },
          ...participantIds.map(id => ({ 
            user_id: id, 
            joined_at: new Date().toISOString(),
            user: users.find(u => u.id === id)
          }))
        ],
        unread_count: 0
      };

      setChats(prevChats => [...prevChats, newChat]);
      return newChat;
    } catch (error: any) {
      toast({
        title: "Failed to create chat",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const sendMessage = async (content: string) => {
    try {
      if (!activeChat || !user) return;

      const newMessage: Message = {
        id: Math.random().toString(36).substring(2, 11),
        chat_id: activeChat.id,
        user_id: user.id,
        content,
        created_at: new Date().toISOString(),
        is_edited: false,
        read_by: [user.id]
      };

      setMessages(prevMessages => [...prevMessages, newMessage]);

      // Update the last message in the chat list
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === activeChat.id 
            ? { ...chat, last_message: newMessage } 
            : chat
        )
      );

    } catch (error: any) {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const editMessage = async (messageId: string, content: string) => {
    try {
      setMessages(prevMessages => 
        prevMessages.map(message => 
          message.id === messageId 
            ? { ...message, content, is_edited: true, updated_at: new Date().toISOString() } 
            : message
        )
      );

      toast({
        title: "Message edited",
        description: "Your message has been updated",
      });
    } catch (error: any) {
      toast({
        title: "Failed to edit message",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      setMessages(prevMessages => prevMessages.filter(message => message.id !== messageId));
      
      toast({
        title: "Message deleted",
        description: "Your message has been removed",
      });
    } catch (error: any) {
      toast({
        title: "Failed to delete message",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addReaction = async (messageId: string, emoji: string) => {
    try {
      if (!user) return;
      
      setMessages(prevMessages => 
        prevMessages.map(message => {
          if (message.id === messageId) {
            const reactions = message.reactions || [];
            const existingReaction = reactions.find(r => r.user_id === user.id && r.emoji === emoji);
            
            if (existingReaction) {
              // Remove reaction if it already exists
              return {
                ...message,
                reactions: reactions.filter(r => !(r.user_id === user.id && r.emoji === emoji))
              };
            } else {
              // Add new reaction
              return {
                ...message,
                reactions: [...reactions, { user_id: user.id, emoji }]
              };
            }
          }
          return message;
        })
      );
    } catch (error: any) {
      toast({
        title: "Failed to add reaction",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const markAsRead = async (chatId: string) => {
    try {
      if (!user) return;
      
      // Mark all messages as read
      setMessages(prevMessages => 
        prevMessages.map(message => {
          if (message.chat_id === chatId && !message.read_by.includes(user.id)) {
            return {
              ...message,
              read_by: [...message.read_by, user.id]
            };
          }
          return message;
        })
      );

      // Update unread count
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === chatId ? { ...chat, unread_count: 0 } : chat
        )
      );
    } catch (error: any) {
      toast({
        title: "Failed to mark messages as read",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const searchMessages = async (query: string): Promise<Message[]> => {
    try {
      // Simple client-side search for now
      if (!query.trim()) return [];
      
      const searchResults = messages.filter(message => 
        message.content.toLowerCase().includes(query.toLowerCase())
      );
      
      return searchResults;
    } catch (error: any) {
      toast({
        title: "Search failed",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChat,
        messages,
        users,
        loadingChats,
        loadingMessages,
        setActiveChat,
        createChat,
        sendMessage,
        editMessage,
        deleteMessage,
        addReaction,
        markAsRead,
        searchMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

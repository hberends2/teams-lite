
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Chat, Message, User, MessageReaction, UserStatus, ChatParticipant } from '@/types';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

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
  const [chatSubscription, setChatSubscription] = useState<RealtimeChannel | null>(null);
  const [messagesSubscription, setMessagesSubscription] = useState<RealtimeChannel | null>(null);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .neq('id', user.id);
          
        if (error) throw error;
        
        const usersList: User[] = data.map(profile => ({
          id: profile.id,
          email: profile.email,
          username: profile.username,
          full_name: profile.full_name,
          status: profile.status as UserStatus,
          created_at: profile.created_at,
          avatar_url: profile.avatar_url || undefined
        }));
        
        setUsers(usersList);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    
    fetchUsers();
  }, [user]);

  // Fetch user's chats
  useEffect(() => {
    const fetchChats = async () => {
      if (!user) {
        setChats([]);
        setLoadingChats(false);
        return;
      }
      
      setLoadingChats(true);
      
      try {
        // Fetch chats where user is a participant
        const { data: participations, error: participationsError } = await supabase
          .from('chat_participants')
          .select('chat_id')
          .eq('user_id', user.id);
          
        if (participationsError) throw participationsError;
        
        if (!participations.length) {
          setChats([]);
          setLoadingChats(false);
          return;
        }
        
        const chatIds = participations.map(p => p.chat_id);
        
        // Fetch chat details
        const { data: chatData, error: chatError } = await supabase
          .from('chats')
          .select('*')
          .in('id', chatIds);
          
        if (chatError) throw chatError;
        
        // Fetch participants for each chat
        const chatsWithParticipants = await Promise.all(chatData.map(async (chat) => {
          const { data: participantData, error: participantError } = await supabase
            .from('chat_participants')
            .select('user_id, joined_at')
            .eq('chat_id', chat.id);
            
          if (participantError) throw participantError;
          
          // Fetch user details for each participant
          const participants: ChatParticipant[] = await Promise.all(
            participantData.map(async (participant) => {
              if (participant.user_id === user.id) {
                return {
                  user_id: user.id,
                  joined_at: participant.joined_at,
                  user
                };
              }
              
              const { data: userData, error: userError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', participant.user_id)
                .single();
                
              if (userError) {
                console.error(`Error fetching user ${participant.user_id}:`, userError);
                return {
                  user_id: participant.user_id,
                  joined_at: participant.joined_at
                };
              }
              
              return {
                user_id: participant.user_id,
                joined_at: participant.joined_at,
                user: userData ? {
                  id: userData.id,
                  email: userData.email,
                  username: userData.username,
                  full_name: userData.full_name,
                  status: userData.status as UserStatus,
                  created_at: userData.created_at,
                  avatar_url: userData.avatar_url || undefined
                } : undefined
              };
            })
          );
          
          // Count unread messages
          const { count, error: countError } = await supabase
            .from('messages')
            .select('id', { count: 'exact' })
            .eq('chat_id', chat.id)
            .not('id', 'in', `(SELECT message_id FROM message_read_status WHERE user_id = '${user.id}')`);
            
          const unreadCount = countError ? 0 : (count || 0);
          
          // Get last message
          const { data: lastMessageData, error: lastMessageError } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chat.id)
            .order('created_at', { ascending: false })
            .limit(1);
            
          const lastMessage = lastMessageError || !lastMessageData.length ? undefined : {
            ...lastMessageData[0],
            read_by: [] // Will be populated later if needed
          };
          
          return {
            ...chat,
            participants,
            unread_count: unreadCount,
            last_message: lastMessage
          };
        }));
        
        setChats(chatsWithParticipants);
      } catch (error) {
        console.error('Error fetching chats:', error);
        toast({
          title: "Failed to load chats",
          description: "There was a problem loading your chats.",
          variant: "destructive",
        });
      } finally {
        setLoadingChats(false);
      }
    };
    
    fetchChats();
    
    // Set up subscription for new chats
    if (user) {
      const subscription = supabase
        .channel('chats-channel')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'chat_participants',
          filter: `user_id=eq.${user.id}`
        }, () => {
          fetchChats();
        })
        .subscribe();
        
      setChatSubscription(subscription);
      
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user, toast]);

  // Fetch messages for active chat
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeChat || !user) {
        setMessages([]);
        return;
      }
      
      setLoadingMessages(true);
      
      try {
        // Fetch messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', activeChat.id)
          .order('created_at', { ascending: true });
          
        if (messagesError) throw messagesError;
        
        // Fetch read status for each message
        const messagesWithReadStatus = await Promise.all(
          messagesData.map(async (message) => {
            const { data: readData, error: readError } = await supabase
              .from('message_read_status')
              .select('user_id')
              .eq('message_id', message.id);
              
            const readBy = readError ? [] : readData.map(r => r.user_id);
            
            // Fetch reactions
            const { data: reactionData, error: reactionError } = await supabase
              .from('message_reactions')
              .select('user_id, emoji')
              .eq('message_id', message.id);
              
            const reactions: MessageReaction[] = reactionError ? [] : 
              reactionData.map(r => ({ user_id: r.user_id, emoji: r.emoji }));
            
            return {
              ...message,
              read_by: readBy,
              reactions: reactions.length > 0 ? reactions : undefined
            };
          })
        );
        
        setMessages(messagesWithReadStatus);
        
        // Mark messages as read
        await markAsRead(activeChat.id);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: "Failed to load messages",
          description: "There was a problem loading messages.",
          variant: "destructive",
        });
      } finally {
        setLoadingMessages(false);
      }
    };
    
    fetchMessages();
    
    // Set up subscription for real-time messages
    if (activeChat && user) {
      const subscription = supabase
        .channel(`messages-${activeChat.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${activeChat.id}`
        }, () => {
          fetchMessages();
        })
        .subscribe();
        
      setMessagesSubscription(subscription);
      
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [activeChat, user, toast]);

  // Clean up subscriptions
  useEffect(() => {
    return () => {
      if (chatSubscription) {
        chatSubscription.unsubscribe();
      }
      if (messagesSubscription) {
        messagesSubscription.unsubscribe();
      }
    };
  }, [chatSubscription, messagesSubscription]);

  const createChat = async (participantIds: string[], name?: string): Promise<Chat> => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      // Create a new chat
      const isGroup = participantIds.length > 1;
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .insert({
          name: name || null,
          is_group: isGroup,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (chatError) throw chatError;
      
      // Add current user as participant
      await supabase
        .from('chat_participants')
        .insert({
          chat_id: chatData.id,
          user_id: user.id,
          joined_at: new Date().toISOString()
        });
      
      // Add other participants
      const participantPromises = participantIds.map(id => 
        supabase
          .from('chat_participants')
          .insert({
            chat_id: chatData.id,
            user_id: id,
            joined_at: new Date().toISOString()
          })
      );
      
      await Promise.all(participantPromises);
      
      // Construct full chat object
      const participants = await Promise.all([
        {
          user_id: user.id,
          joined_at: new Date().toISOString(),
          user
        },
        ...participantIds.map(async (id) => {
          const userObj = users.find(u => u.id === id);
          return {
            user_id: id,
            joined_at: new Date().toISOString(),
            user: userObj
          };
        })
      ]);
      
      const newChat: Chat = {
        ...chatData,
        participants,
        unread_count: 0
      };
      
      setChats(prevChats => [...prevChats, newChat]);
      return newChat;
    } catch (error: any) {
      console.error('Error creating chat:', error);
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
      if (!activeChat || !user) throw new Error('No active chat or user');
      
      // Create message
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          chat_id: activeChat.id,
          user_id: user.id,
          content,
          created_at: new Date().toISOString(),
          updated_at: null,
          is_edited: false
        })
        .select()
        .single();
        
      if (messageError) throw messageError;
      
      // Mark as read by the sender
      await supabase
        .from('message_read_status')
        .insert({
          message_id: messageData.id,
          user_id: user.id,
          read_at: new Date().toISOString()
        });
      
      // Update local state (optimistic update)
      const newMessage: Message = {
        ...messageData,
        read_by: [user.id],
        reactions: []
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
      console.error('Error sending message:', error);
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const editMessage = async (messageId: string, content: string) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      // Check if user owns the message
      const targetMessage = messages.find(m => m.id === messageId);
      if (!targetMessage) throw new Error('Message not found');
      if (targetMessage.user_id !== user.id) throw new Error('Cannot edit another user\'s message');
      
      const now = new Date().toISOString();
      
      const { error } = await supabase
        .from('messages')
        .update({
          content,
          updated_at: now,
          is_edited: true
        })
        .eq('id', messageId);
        
      if (error) throw error;
      
      // Update local state
      setMessages(prevMessages => 
        prevMessages.map(message => 
          message.id === messageId 
            ? { ...message, content, is_edited: true, updated_at: now } 
            : message
        )
      );
      
      toast({
        title: "Message edited",
        description: "Your message has been updated",
      });
    } catch (error: any) {
      console.error('Error editing message:', error);
      toast({
        title: "Failed to edit message",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      // Check if user owns the message
      const targetMessage = messages.find(m => m.id === messageId);
      if (!targetMessage) throw new Error('Message not found');
      if (targetMessage.user_id !== user.id) throw new Error('Cannot delete another user\'s message');
      
      // Delete message reactions
      await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId);
        
      // Delete message read status
      await supabase
        .from('message_read_status')
        .delete()
        .eq('message_id', messageId);
        
      // Delete the message
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);
        
      if (error) throw error;
      
      // Update local state
      setMessages(prevMessages => prevMessages.filter(message => message.id !== messageId));
      
      toast({
        title: "Message deleted",
        description: "Your message has been removed",
      });
    } catch (error: any) {
      console.error('Error deleting message:', error);
      toast({
        title: "Failed to delete message",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addReaction = async (messageId: string, emoji: string) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const message = messages.find(m => m.id === messageId);
      if (!message) throw new Error('Message not found');
      
      const existingReaction = message.reactions?.find(
        r => r.user_id === user.id && r.emoji === emoji
      );
      
      if (existingReaction) {
        // Remove the reaction
        const { error } = await supabase
          .from('message_reactions')
          .delete()
          .eq('message_id', messageId)
          .eq('user_id', user.id)
          .eq('emoji', emoji);
          
        if (error) throw error;
        
        // Update local state
        setMessages(prevMessages => 
          prevMessages.map(message => {
            if (message.id === messageId && message.reactions) {
              return {
                ...message,
                reactions: message.reactions.filter(
                  r => !(r.user_id === user.id && r.emoji === emoji)
                )
              };
            }
            return message;
          })
        );
      } else {
        // Add the reaction
        const { error } = await supabase
          .from('message_reactions')
          .insert({
            message_id: messageId,
            user_id: user.id,
            emoji,
            created_at: new Date().toISOString()
          });
          
        if (error) throw error;
        
        // Update local state
        setMessages(prevMessages => 
          prevMessages.map(message => {
            if (message.id === messageId) {
              const reactions = message.reactions || [];
              return {
                ...message,
                reactions: [...reactions, { user_id: user.id, emoji }]
              };
            }
            return message;
          })
        );
      }
    } catch (error: any) {
      console.error('Error with reaction:', error);
      toast({
        title: "Failed to add reaction",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const markAsRead = async (chatId: string) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      // Get all unread messages in this chat
      const unreadMessages = messages.filter(
        m => m.chat_id === chatId && 
             m.user_id !== user.id && 
             !m.read_by.includes(user.id)
      );
      
      if (unreadMessages.length === 0) return;
      
      // Mark all as read
      const readPromises = unreadMessages.map(message => 
        supabase
          .from('message_read_status')
          .insert({
            message_id: message.id,
            user_id: user.id,
            read_at: new Date().toISOString()
          })
      );
      
      await Promise.all(readPromises);
      
      // Update local state
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
      
      // Update unread count in the chat list
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === chatId ? { ...chat, unread_count: 0 } : chat
        )
      );
    } catch (error: any) {
      console.error('Error marking as read:', error);
      toast({
        title: "Failed to mark messages as read",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const searchMessages = async (query: string): Promise<Message[]> => {
    try {
      if (!query.trim()) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .textSearch('content', query, { config: 'english' });
        
      if (error) throw error;
      
      // Format as Message objects
      const searchResults: Message[] = await Promise.all(
        data.map(async (message) => {
          // Fetch read status
          const { data: readData } = await supabase
            .from('message_read_status')
            .select('user_id')
            .eq('message_id', message.id);
            
          const readBy = readData?.map(r => r.user_id) || [];
          
          // Fetch reactions
          const { data: reactionData } = await supabase
            .from('message_reactions')
            .select('user_id, emoji')
            .eq('message_id', message.id);
            
          const reactions: MessageReaction[] = reactionData?.map(r => ({
            user_id: r.user_id,
            emoji: r.emoji
          })) || [];
          
          return {
            ...message,
            read_by: readBy,
            reactions: reactions.length > 0 ? reactions : undefined
          };
        })
      );
      
      return searchResults;
    } catch (error: any) {
      console.error('Search error:', error);
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

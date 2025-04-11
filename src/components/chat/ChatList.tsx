
import { useState } from "react";
import { useChat } from "@/contexts/ChatContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/UserAvatar";
import { Chat } from "@/types";
import { Search } from "lucide-react";

export function ChatList() {
  const { chats, activeChat, setActiveChat, loadingChats } = useChat();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter chats based on search query
  const filteredChats = searchQuery.trim() 
    ? chats.filter(chat => {
        const chatName = getChatName(chat);
        return chatName.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : chats;
  
  // Helper function to get chat name
  const getChatName = (chat: Chat) => {
    if (chat.name) return chat.name;
    
    // For 1:1 chats, show the other person's name
    const otherParticipants = chat.participants.filter(p => p.user && p.user.id !== "current-user-id");
    if (otherParticipants.length > 0 && otherParticipants[0].user) {
      return otherParticipants[0].user.full_name;
    }
    
    return "Chat";
  };

  if (loadingChats) {
    return (
      <div className="flex flex-col h-full p-4">
        <div className="flex items-center gap-2 mb-4">
          <Input 
            placeholder="Search chats..."
            className="bg-muted/30"
            disabled
          />
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-md animate-pulse">
              <div className="w-10 h-10 rounded-full bg-muted" />
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center gap-2 mb-4">
        <Input 
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-muted/30"
        />
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Search size={18} />
        </Button>
      </div>
      
      {filteredChats.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <p>No chats found</p>
        </div>
      ) : (
        <div className="space-y-1 overflow-y-auto">
          {filteredChats.map((chat) => {
            // Determine the other user in 1:1 chats
            const otherUser = chat.participants.find(p => p.user && p.user.id !== "current-user-id")?.user;
            
            return (
              <button
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                className={`flex items-center gap-3 p-2 rounded-md w-full text-left transition-colors ${
                  activeChat?.id === chat.id
                    ? "bg-teams-primary text-white"
                    : "hover:bg-muted/50"
                }`}
              >
                {chat.is_group ? (
                  <div className="flex -space-x-2">
                    {chat.participants.slice(0, 2).map((participant) => (
                      participant.user && (
                        <UserAvatar
                          key={participant.user.id}
                          user={participant.user}
                          className="h-8 w-8 border-2 border-background"
                        />
                      )
                    ))}
                  </div>
                ) : (
                  otherUser && <UserAvatar user={otherUser} showStatus />
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`font-medium truncate ${activeChat?.id === chat.id ? "text-white" : ""}`}>
                      {chat.is_group ? chat.name : otherUser?.full_name}
                    </span>
                    {chat.unread_count ? (
                      <span className="ml-2 bg-teams-danger text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {chat.unread_count}
                      </span>
                    ) : null}
                  </div>
                  {chat.last_message && (
                    <p className={`text-xs truncate ${
                      activeChat?.id === chat.id ? "text-white/80" : "text-muted-foreground"
                    }`}>
                      {chat.last_message.content}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

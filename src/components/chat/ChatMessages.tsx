import { useEffect, useRef } from "react";
import { useChat } from "@/contexts/ChatContext";
import { MessageBubble } from "./MessageBubble";
import { useAuth } from "@/contexts/AuthContext";

export function ChatMessages() {
  const { messages, activeChat, loadingMessages } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 text-muted-foreground">
        <p>Select a chat to start messaging</p>
      </div>
    );
  }

  if (loadingMessages) {
    return (
      <div className="flex-1 p-4 overflow-y-auto">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex mb-4 animate-pulse">
            <div className="h-10 w-10 rounded-full bg-muted mr-2" />
            <div className="flex-1">
              <div className="h-4 bg-muted rounded w-24 mb-2" />
              <div className="h-16 bg-muted rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Find the sender for each message
  const getSender = (userId: string) => {
    // If it's the current user
    if (user && userId === user.id) {
      return user;
    }
    
    // Otherwise find from participants
    const sender = activeChat.participants.find(p => p.user_id === userId)?.user;
    
    // Fallback if user not found
    return sender || {
      id: userId,
      email: "unknown@example.com",
      username: "unknown",
      full_name: "Unknown User",
      status: "offline",
      created_at: new Date().toISOString()
    };
  };

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isCurrentUser={message.user_id === user?.id}
              sender={getSender(message.user_id)}
            />
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}

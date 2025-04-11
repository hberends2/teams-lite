
import { useChat } from "@/contexts/ChatContext";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/UserAvatar";
import { MoreVertical, Phone, Video } from "lucide-react";

export function ChatHeader() {
  const { activeChat } = useChat();
  
  if (!activeChat) return null;

  // Determine chat details
  const isGroup = activeChat.is_group;
  const chatName = isGroup ? 
    activeChat.name : 
    activeChat.participants
      .filter(p => p.user?.id !== "current-user-id")
      .map(p => p.user?.full_name)
      .join(", ");
  
  // For 1:1 chats, get the other user
  const otherUser = !isGroup ? 
    activeChat.participants.find(p => p.user?.id !== "current-user-id")?.user : 
    undefined;
  
  return (
    <div className="h-16 px-4 border-b flex items-center justify-between">
      <div className="flex items-center gap-3">
        {isGroup ? (
          <div className="flex -space-x-2">
            {activeChat.participants.slice(0, 3).map((participant) => (
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
        
        <div>
          <h2 className="font-semibold">{chatName}</h2>
          {isGroup && (
            <p className="text-xs text-muted-foreground">
              {activeChat.participants.length} members
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon">
          <Phone size={18} />
        </Button>
        <Button variant="ghost" size="icon">
          <Video size={18} />
        </Button>
        <Button variant="ghost" size="icon">
          <MoreVertical size={18} />
        </Button>
      </div>
    </div>
  );
}

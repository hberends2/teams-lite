
import { useState } from "react";
import { UserAvatar } from "@/components/UserAvatar";
import { Message, User } from "@/types";
import { useChat } from "@/contexts/ChatContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Smile, Edit2, Trash, Check, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  sender: User;
}

export function MessageBubble({ message, isCurrentUser, sender }: MessageBubbleProps) {
  const { editMessage, deleteMessage, addReaction } = useChat();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [showActions, setShowActions] = useState(false);
  
  // Common emojis for reactions
  const commonEmojis = ["👍", "❤️", "😂", "😢", "😠", "👏", "🎉"];

  const handleSaveEdit = async () => {
    if (editedContent.trim() && editedContent !== message.content) {
      await editMessage(message.id, editedContent);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedContent(message.content);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this message?")) {
      await deleteMessage(message.id);
    }
  };

  const handleAddReaction = async (emoji: string) => {
    await addReaction(message.id, emoji);
  };
  
  const getTimeString = () => {
    try {
      return formatDistanceToNow(new Date(message.created_at), { addSuffix: true });
    } catch (e) {
      return "recently";
    }
  };
  
  return (
    <div 
      className={`flex mb-4 ${isCurrentUser ? "flex-row-reverse" : ""}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex-shrink-0 mt-1">
        <UserAvatar user={sender} />
      </div>
      
      <div className={`mx-2 max-w-[70%] ${isCurrentUser ? "items-end" : "items-start"}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">{sender.full_name}</span>
          <span className="text-xs text-muted-foreground">{getTimeString()}</span>
          {message.is_edited && <span className="text-xs text-muted-foreground">(edited)</span>}
        </div>
        
        <div 
          className={`rounded-lg p-3 ${
            isCurrentUser ? "bg-teams-primary text-white" : "bg-muted/50"
          }`}
        >
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <Input 
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="bg-background"
              />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                  <X size={16} />
                </Button>
                <Button size="sm" variant="ghost" onClick={handleSaveEdit}>
                  <Check size={16} />
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
              
              {/* Message reactions */}
              {message.reactions && message.reactions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {Object.entries(
                    message.reactions.reduce<Record<string, number>>((acc, reaction) => {
                      acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
                      return acc;
                    }, {})
                  ).map(([emoji, count]) => (
                    <button
                      key={emoji}
                      onClick={() => handleAddReaction(emoji)}
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                        isCurrentUser ? "bg-white/20" : "bg-background"
                      }`}
                    >
                      {emoji} {count}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Read receipt */}
        {isCurrentUser && message.read_by.length > 1 && (
          <div className="mt-1 text-xs text-right text-muted-foreground">
            Seen
          </div>
        )}
        
        {/* Message actions */}
        {showActions && isCurrentUser && !isEditing && (
          <div className="flex gap-1 mt-1 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
              <Edit2 size={14} />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDelete}>
              <Trash size={14} />
            </Button>
            <div className="relative">
              <Button variant="ghost" size="sm" onClick={() => {}}>
                <Smile size={14} />
              </Button>
              <div className="absolute right-0 bottom-full mb-2 bg-background shadow rounded-lg p-2 flex gap-1">
                {commonEmojis.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => handleAddReaction(emoji)}
                    className="hover:bg-muted rounded-full p-1 text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChat } from "@/contexts/ChatContext";
import { Send, Smile } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const commonEmojis = ["👍", "❤️", "😂", "😢", "😠", "👏", "🎉", "💯"];

export function MessageInput() {
  const { sendMessage, activeChat } = useChat();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Autofocus the textarea when active chat changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [activeChat]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      await sendMessage(message);
      setMessage("");
    } finally {
      setIsSubmitting(false);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Send message on Enter key (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const insertEmoji = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  if (!activeChat) return null;

  return (
    <form onSubmit={handleSubmit} className="border-t p-3">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message"
            className="min-h-[60px] max-h-[200px] resize-none pr-12"
            disabled={isSubmitting}
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 bottom-2"
              >
                <Smile size={20} className="text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="end" alignOffset={0} sideOffset={5}>
              <div className="flex flex-wrap gap-2 justify-center">
                {commonEmojis.map((emoji) => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    className="h-9 w-9 p-0 text-lg"
                    onClick={() => insertEmoji(emoji)}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <Button 
          type="submit" 
          disabled={!message.trim() || isSubmitting}
          size="icon"
        >
          <Send size={18} />
        </Button>
      </div>
    </form>
  );
}

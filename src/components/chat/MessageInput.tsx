
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChat } from "@/contexts/ChatContext";
import { PaperclipIcon, Send, Smile } from "lucide-react";

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
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 bottom-2"
          >
            <Smile size={20} className="text-muted-foreground" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="icon">
            <PaperclipIcon size={20} className="text-muted-foreground" />
          </Button>
          <Button 
            type="submit" 
            disabled={!message.trim() || isSubmitting}
            size="icon"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </form>
  );
}

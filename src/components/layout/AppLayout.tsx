
import { useState, ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/ui/user-menu";
import { MessageSquare, FileIcon, Plus } from "lucide-react";
import { ChatList } from "@/components/chat/ChatList";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { MessageInput } from "@/components/chat/MessageInput";
import { FileUploadModal } from "@/components/files/FileUploadModal";
import { FileTable } from "@/components/files/FileTable";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/common/Logo";

interface AppLayoutProps {
  children?: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("messages");
  const [showUploadModal, setShowUploadModal] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 h-full bg-muted/20 border-r flex flex-col">
        <div className="h-14 flex items-center justify-between px-4 border-b">
          <Logo />
          <UserMenu />
        </div>
        <Tabs defaultValue="messages" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-2 m-2">
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare size={16} />
              <span>Messages</span>
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-2">
              <FileIcon size={16} />
              <span>Files</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="messages" className="flex-1 flex flex-col">
            <ChatList />
            
            <div className="p-3 border-t">
              <Button className="w-full flex items-center gap-2" size="sm">
                <Plus size={16} />
                New Chat
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="files" className="flex-1 flex flex-col">
            <div className="p-4 flex-1">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Files</h2>
                <Button 
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-2" 
                  size="sm"
                >
                  <Plus size={16} />
                  Upload
                </Button>
              </div>
              
              <div className="bg-card p-2 rounded-md h-[calc(100%-60px)] overflow-y-auto">
                <p className="text-sm text-muted-foreground mb-2">
                  All uploaded files will be visible to team members.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {activeTab === "messages" ? (
          <>
            <ChatHeader />
            <ChatMessages />
            <MessageInput />
          </>
        ) : (
          <div className="p-6 flex-1 overflow-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">Team Files</h1>
              <p className="text-muted-foreground">
                All files shared by your team members
              </p>
            </div>
            <FileTable />
          </div>
        )}
      </div>
      
      {/* File upload modal */}
      <FileUploadModal 
        open={showUploadModal} 
        onClose={() => setShowUploadModal(false)} 
      />
    </div>
  );
}

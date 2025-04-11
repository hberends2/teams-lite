
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/UserAvatar";
import { useAuth } from "@/contexts/AuthContext";
import { User, UserStatus } from "@/types";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";
import { LogOut, Settings, Key } from "lucide-react";

interface StatusOption {
  label: string;
  value: UserStatus;
  icon: React.ReactNode;
}

export function UserMenu() {
  const { user, signOut, updateStatus } = useAuth();
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const statusOptions: StatusOption[] = [
    {
      label: "Online",
      value: "online",
      icon: <span className="h-2 w-2 rounded-full bg-teams-success mr-2" />
    },
    {
      label: "Away",
      value: "away",
      icon: <span className="h-2 w-2 rounded-full bg-teams-away mr-2" />
    },
    {
      label: "Offline",
      value: "offline",
      icon: <span className="h-2 w-2 rounded-full bg-teams-offline mr-2" />
    }
  ];

  const handleChangeStatus = async (status: UserStatus) => {
    await updateStatus(status);
  };

  if (!user) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <UserAvatar user={user} showStatus />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{user.full_name}</p>
              <p className="text-xs text-muted-foreground">{user.username}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuLabel>Status</DropdownMenuLabel>
          {statusOptions.map((option) => (
            <DropdownMenuItem 
              key={option.value} 
              onSelect={() => handleChangeStatus(option.value)}
              className="flex items-center cursor-pointer"
            >
              {option.icon}
              {option.label}
              {user.status === option.value && (
                <span className="ml-auto text-xs text-muted-foreground">
                  ✓
                </span>
              )}
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onSelect={() => setShowPasswordForm(true)}
            className="flex items-center cursor-pointer"
          >
            <Key className="mr-2 h-4 w-4" />
            Change Password
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="flex items-center cursor-pointer"
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onSelect={() => signOut()}
            className="flex items-center cursor-pointer text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Dialog open={showPasswordForm} onOpenChange={setShowPasswordForm}>
        <DialogContent>
          <ChangePasswordForm onClose={() => setShowPasswordForm(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

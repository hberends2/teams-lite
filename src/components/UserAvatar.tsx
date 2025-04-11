
import React from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, UserStatus } from '@/types';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  user: User;
  showStatus?: boolean;
  className?: string;
}

export function UserAvatar({ user, showStatus = false, className }: UserAvatarProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getStatusColor = (status: UserStatus) => {
    switch(status) {
      case 'online':
        return 'bg-teams-success';
      case 'away':
        return 'bg-teams-away';
      case 'offline':
      default:
        return 'bg-teams-offline';
    }
  };

  return (
    <div className="relative">
      <Avatar className={cn("h-10 w-10", className)}>
        <AvatarFallback className="bg-teams-primary text-white">
          {getInitials(user.full_name)}
        </AvatarFallback>
      </Avatar>
      
      {showStatus && (
        <span 
          className={cn(
            "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
            getStatusColor(user.status)
          )}
        />
      )}
    </div>
  );
}


import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string, fullName: string) => Promise<void>;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateStatus: (status: UserStatus) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  updatePassword: async () => {},
  updateStatus: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // This is a placeholder for Supabase integration
  // When Supabase is connected, this will be replaced with actual auth logic
  useEffect(() => {
    // Placeholder for session check
    const checkSession = async () => {
      try {
        // Mock user for development
        const mockUser = localStorage.getItem('mockUser');
        
        if (mockUser) {
          setUser(JSON.parse(mockUser));
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
  }, []);

  const signUp = async (email: string, password: string, username: string, fullName: string) => {
    try {
      // Mock signup - will be replaced with Supabase
      const mockUser: User = {
        id: Math.random().toString(36).substring(2, 11),
        email,
        username,
        full_name: fullName,
        status: 'online',
        created_at: new Date().toISOString(),
      };
      
      localStorage.setItem('mockUser', JSON.stringify(mockUser));
      setUser(mockUser);
      toast({
        title: "Account created",
        description: "You've been successfully signed up",
      });
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signIn = async (username: string, password: string) => {
    try {
      // Mock signin - will be replaced with Supabase
      const mockUser: User = {
        id: Math.random().toString(36).substring(2, 11),
        email: `${username}@example.com`,
        username,
        full_name: username.includes(' ') ? username : `${username} User`,
        status: 'online',
        created_at: new Date().toISOString(),
      };
      
      localStorage.setItem('mockUser', JSON.stringify(mockUser));
      setUser(mockUser);
      toast({
        title: "Welcome back!",
        description: "You've been successfully signed in",
      });
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Mock signout - will be replaced with Supabase
      localStorage.removeItem('mockUser');
      setUser(null);
      toast({
        title: "Signed out",
        description: "You've been successfully signed out",
      });
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      // Mock password update - will be replaced with Supabase
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated",
      });
    } catch (error: any) {
      toast({
        title: "Password update failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateStatus = async (status: UserStatus) => {
    try {
      // Mock status update - will be replaced with Supabase
      if (user) {
        const updatedUser = { ...user, status };
        localStorage.setItem('mockUser', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (error: any) {
      toast({
        title: "Status update failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, updatePassword, updateStatus }}>
      {children}
    </AuthContext.Provider>
  );
};


import { useState } from "react";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, loading } = useAuth();
  const [isSignIn, setIsSignIn] = useState(true);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teams-primary border-t-transparent mx-auto mb-4" />
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is logged in, show app layout
  if (user) {
    return <AppLayout />;
  }

  // Auth forms
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2">
            <div className="bg-teams-primary text-white rounded-md p-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">Teams Lite</h1>
          </div>
        </div>
        
        {isSignIn ? (
          <SignInForm onToggle={() => setIsSignIn(false)} />
        ) : (
          <SignUpForm onToggle={() => setIsSignIn(true)} />
        )}
      </div>
    </div>
  );
};

export default Index;

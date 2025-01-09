import React, { createContext, useContext, useState, useEffect } from 'react';

type ChatAuthContextType = {
  isChatAuthenticated: boolean;
  chatUser: any | null;
  chatLogin: (token: string) => void;
  chatLogout: () => void;
  chatSignup: (token: string) => void;
};

const ChatAuthContext = createContext<ChatAuthContextType | undefined>(undefined);

export function ChatAuthProvider({ children }: { children: React.ReactNode }) {
  const [isChatAuthenticated, setIsChatAuthenticated] = useState(false);
  const [chatUser, setChatUser] = useState(null);

  useEffect(() => {
    const chatToken = localStorage.getItem('chat_token');
    if (chatToken) {
      setIsChatAuthenticated(true);
    }
  }, []);

  const chatLogin = (token: string) => {
    localStorage.setItem('chat_token', token);
    setIsChatAuthenticated(true);
  };

  const chatSignup = (token: string) => {
    localStorage.setItem('chat_token', token);
    setIsChatAuthenticated(true);
  };

  const chatLogout = () => {
    localStorage.removeItem('chat_token');
    setIsChatAuthenticated(false);
    setChatUser(null);
  };

  return (
    <ChatAuthContext.Provider 
      value={{ 
        isChatAuthenticated, 
        chatUser, 
        chatLogin, 
        chatLogout,
        chatSignup 
      }}
    >
      {children}
    </ChatAuthContext.Provider>
  );
}

export const useChatAuth = () => {
  const context = useContext(ChatAuthContext);
  if (context === undefined) {
    throw new Error('useChatAuth must be used within a ChatAuthProvider');
  }
  return context;
};
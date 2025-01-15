import { useState, useRef, useEffect } from "react";
import { X, Send, User } from "lucide-react";
import { useChatAuth } from "../../context/ChatAuthContext";
import axios from "axios";


interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatAuthState {
  isLogin: boolean;
  email: string;
  password: string;
  username?: string;
}


const ChatWindow = ({ isOpen, onClose }: ChatWindowProps) => {
  const { isChatAuthenticated, chatLogin, chatSignup } = useChatAuth();
  const [authState, setAuthState] = useState<ChatAuthState>({
    isLogin: true,
    email: '',
    password: '',
    username: ''
  });

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = authState.isLogin ? '/chatbot/login' : '/chatbot/signup';
      const payload = authState.isLogin ? {
        username: authState.username,
        password: authState.password
      } : {
        email: authState.email,
        password: authState.password,
        username: authState.username
      };
  
      const response = await axios.post(`http://127.0.0.1:5000${endpoint}`, payload);
      
      if (authState.isLogin) {
        chatLogin(response.data.token);
      } else {
        chatSignup(response.data.token);
      }
      

      setAuthState({
        isLogin: true,
        email: '',
        password: '',
        username: ''
      });
    } catch (error) {
      console.error('Auth error:', error);
    }
  };
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await axios.post("http://127.0.0.1:5000/simple-chat", {
        prompt: inputValue
      });

      const botMessage: Message = {
        id: messages.length + 2,
        text: response.data.response,
        sender: "bot",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting response:', error);
      const errorMessage: Message = {
        id: messages.length + 2,
        text: "Sorry, I encountered an error. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`fixed bottom-6 right-6 w-96 h-[600px] bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl flex flex-col transition-all duration-300 ${
      isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0"
    }`}>
      {!isChatAuthenticated ? (

        <div className="p-6">
          <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
          
          <h3 className="text-lg font-semibold mb-4">
            {authState.isLogin ? 'Chat Login' : 'Create Chat Account'}
          </h3>

          <form onSubmit={handleAuthSubmit} className="w-full space-y-4">
            {!authState.isLogin && (
              <input
              type="email"
              placeholder="Email"
              className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
              value={authState.email}
              onChange={(e) => setAuthState(prev => ({ ...prev, email: e.target.value }))}
            />
            )}
            
            
            <input
                type="text"
                placeholder="Username"
                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                value={authState.username}
                onChange={(e) => setAuthState(prev => ({ ...prev, username: e.target.value }))}
              />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
              value={authState.password}
              onChange={(e) => setAuthState(prev => ({ ...prev, password: e.target.value }))}
            />
            
            <button type="submit" className="w-full bg-primary text-primary-foreground p-2 rounded hover:opacity-90">
              {authState.isLogin ? 'Login' : 'Sign Up'}
            </button>
          </form>

          <button
            onClick={() => setAuthState(prev => ({ ...prev, isLogin: !prev.isLogin }))}
            className="mt-4 text-sm text-primary hover:underline"
          >
            {authState.isLogin ? 'Create new account' : 'Already have an account?'}
          </button>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h2 className="text-lg font-semibold text-primary">Chat Assistant</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`message-bubble flex gap-2 ${
                    message.sender === "user"
                      ? "bg-accent text-accent-foreground ml-12"
                      : "bg-muted text-primary mr-12"
                  } p-3 rounded-lg`}
                >
                  {message.sender === "bot" && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <p className="text-sm">{message.text}</p>
                    <span className="text-xs text-muted-foreground mt-1">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-muted text-primary p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="bg-primary text-primary-foreground p-2 rounded-md hover:opacity-90 transition-opacity"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default ChatWindow;
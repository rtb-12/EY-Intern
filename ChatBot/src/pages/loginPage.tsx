import { useState } from "react";
import ChatButton from "../components/ChatBot/ChatButton";
import ChatWindow from "../components/ChatBot/ChatWindow";
import LoginForm from "@/components/login-form";
const LogIn = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="relative z-10">
      <div className="h-screen w-full dark:bg-black bg-white dark:bg-grid-white/[0.2] bg-grid-black/[0.2] relative flex items-center justify-center">
        <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        <div className="relative z-10 text-center space-y-4">
          <LoginForm />
        </div>
      </div>
      <div className="relative z-50">
        <ChatButton onClick={() => setIsChatOpen(true)} isOpen={isChatOpen} />
        <ChatWindow isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </div>
    </div>
  );
};

export default LogIn;
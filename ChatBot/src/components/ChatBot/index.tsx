import { useState } from "react";
import ChatButton from "./ChatButton";
import ChatWindow  from "./ChatWindow";

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <ChatWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <ChatButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
    </>
  );
};
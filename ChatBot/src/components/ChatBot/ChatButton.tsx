import { MessageCircle } from "lucide-react";

interface ChatButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

const ChatButton = ({ onClick, isOpen }: ChatButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 p-4 rounded-full border-2 border-gray-600 dark:border-gray-400 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl hover:border-gray-800 dark:hover:border-gray-200 transition-all duration-300 ${
        isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
      }`}
      aria-label="Open chat"
    >
      <MessageCircle className="w-6 h-6 text-gray-800 dark:text-gray-200" />
    </button>
  );
};

export default ChatButton;
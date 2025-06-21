import type { Message } from "@/backend/db/schema";
import { useState } from "react";
import { Chat } from "./Chat";

interface ChatWindowProps {
  messages: Message[];
  viewingUser: string;
  onSendMessage: (content: string) => void;
}

export function ChatWindow({ messages, viewingUser, onSendMessage }: ChatWindowProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 left-4 w-80 h-96 bg-base-100 border border-base-300 rounded-lg shadow-lg z-50">
          <div className="flex justify-between items-center p-3 border-b border-base-300">
            <h3 className="font-semibold">Chat</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-ghost btn-sm btn-circle"
            >
              ✕
            </button>
          </div>
          <div className="h-full pb-12">
            <Chat 
              messages={messages} 
              viewingUser={viewingUser} 
              onSendMessage={onSendMessage} 
            />
          </div>
        </div>
      )}

      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-4 btn btn-primary btn-circle shadow-lg z-40"
      >
        💬
      </button>
    </>
  );
}

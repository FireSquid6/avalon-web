import type { Message } from "server/db/schema";
import { useState } from "react";

interface ChatProps {
  messages: Message[];
  viewingUser: string;
  onSendMessage: (content: string) => void;
}

export function Chat({ messages, viewingUser, onSendMessage }: ChatProps) {
  const [messageInput, setMessageInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      onSendMessage(messageInput.trim());
      setMessageInput("");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-2 p-4 flex-1 overflow-y-auto">
        {messages.map((message) => {
          const isOwnMessage = message.userId === viewingUser;
          
          return (
            <div
              key={message.id}
              className={`chat ${isOwnMessage ? 'chat-end' : 'chat-start'}`}
            >
              <div className="chat-header">
                {message.userId}
                <time className="text-xs opacity-50 ml-1">
                  {new Date(message.sent).toLocaleTimeString()}
                </time>
              </div>
              <div className={`chat-bubble ${isOwnMessage ? 'chat-bubble-primary' : ''}`}>
                {message.content}
              </div>
            </div>
          );
        })}
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type a message..."
          className="input input-bordered flex-1"
        />
        <button type="submit" className="btn btn-primary">
          Send
        </button>
      </form>
    </div>
  );
}

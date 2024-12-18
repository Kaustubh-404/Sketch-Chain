

// src/components/Chat.tsx
import { useState } from 'react';
import { Socket } from 'socket.io-client';
import { useGameStore } from '@/store/gameStore';

interface ChatProps {
  socket: Socket | null;
}

export const Chat = ({ socket }: ChatProps) => {
  const [message, setMessage] = useState('');
  const { chatMessages, isDrawing, roundActive } = useGameStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !message.trim()) return;

    if (isDrawing) {
      socket.emit('chatMessage', message);
    } else {
      socket.emit('guess', message);
    }
    setMessage('');
  };

  return (
    <div className="flex flex-col h-[400px] bg-white rounded-lg shadow">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {chatMessages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 rounded ${
              msg.type === 'system'
                ? 'bg-gray-100 text-gray-600'
                : msg.type === 'guess'
                ? 'bg-blue-100'
                : 'bg-gray-100'
            } max-w-[80%] ${msg.type === 'guess' ? 'ml-auto' : ''}`}
          >
            <div className="text-xs text-gray-500">
              {msg.player.slice(0, 6)}...
            </div>
            <div>{msg.text}</div>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={isDrawing ? "Chat..." : "Enter your guess..."}
            className="flex-1 px-4 py-2 border rounded"
            disabled={!roundActive}
          />
          <button
            type="submit"
            disabled={!roundActive}
            className="px-2 py-2 bg-blue-500 text-red-600 rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            Send
          </button>
        </div>
      </form> 
    </div>
  );
};
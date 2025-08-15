import React, { FC, useState, useEffect, useRef } from 'react';
import { useAuth } from './App';
import { SendHorizonal, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

// ⚡ IMPORTANT: Replace this with your backend's base URL.
// Since you're using FastAPI, the default is likely port 8000.
const BASE_URL = 'http://127.0.0.1:8000';

// Define the type for a message, based on your backend model
interface Message {
  id: string; // The backend returns an 'id' string
  content: string;
  userId: string;
  createdAt: string;
}

interface RoomsPageProps {
  room: { id: string; name: string };
  onLeaveRoom: () => void;
}

const RoomsPage: FC<RoomsPageProps> = ({ room, onLeaveRoom }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [ws, setWs] = useState<WebSocket | null>(null);

  // Use a ref to store messages to avoid stale closures in WebSocket event listeners
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Effect to fetch initial messages and set up the WebSocket connection
  useEffect(() => {
    // We'll use an async function inside the useEffect to get the token
    const setupChat = async () => {
      if (!currentUser) return; // Exit if the user is not authenticated

      try {
        // 1. Get the authentication token from the current user
        const idToken = await currentUser.getIdToken();
        console.log("Successfully retrieved auth token for WebSocket:", idToken);

        // 2. Fetch initial message history securely with the token
        setLoading(true);
        const response = await fetch(`${BASE_URL}/messages/by_room/${room.id}`, {
          headers: {
            'Authorization': `Bearer ${idToken}`, // Add the Authorization header
          },
        });
        if (!response.ok) throw new Error('Failed to fetch messages.');
        const data = await response.json();
        setMessages(data);
        setLoading(false);

        // 3. Set up WebSocket connection with the token
        // THIS IS THE CRITICAL CHANGE!
        const wsUrl = `ws://127.0.0.1:8000/messages/ws/${room.id}?token=${idToken}`;
        const websocket = new WebSocket(wsUrl);
        setWs(websocket);

        websocket.onopen = () => {
          console.log('WebSocket connection established.');
        };

        websocket.onmessage = (event) => {
          console.log('Received message:', event.data);
          const message = JSON.parse(event.data);
          if (message.error) {
            console.error('WebSocket error from server:', message.error);
            return;
          }
          setMessages((prevMessages) => [...prevMessages, message]);
        };

        websocket.onclose = () => {
          console.log('WebSocket connection closed.');
        };

        websocket.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        // Clean up the WebSocket connection when the component unmounts or room changes
        return () => {
          websocket.close();
        };

      } catch (error) {
        console.error('Error setting up chat:', error);
        setLoading(false);
      }
    };

    setupChat();
  }, [room.id, currentUser]); // Rerun effect if room or user changes

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !currentUser || !ws) return;

    if (ws.readyState === WebSocket.OPEN) {
      // ⚡ IMPORTANT: The message payload must match what your backend expects.
      // Your FastAPI `websocket_endpoint` expects a JSON object with a 'content' field.
      const messagePayload = { content: newMessage };
      ws.send(JSON.stringify(messagePayload));
      setNewMessage('');
    } else {
      console.error('WebSocket is not open.');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner">
      <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4">
        <motion.button
          onClick={onLeaveRoom}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
        <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
          Room: {room.name}
        </h2>
      </header>

      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${
                msg.userId === currentUser?.uid ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-xl shadow-md ${
                  msg.userId === currentUser?.uid
                    ? 'bg-emerald-500 text-white rounded-br-none'
                    : 'bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-bl-none'
                }`}
              >
                <div
                  className={`text-sm font-semibold mb-1 ${
                    msg.userId === currentUser?.uid
                      ? 'text-white'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {msg.userId}
                </div>
                <p className="text-sm">{msg.content}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <form onSubmit={handleSendMessage} className="mt-4 flex gap-2 p-4">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-3 border border-gray-300 dark:border-gray-700 rounded-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="submit"
          className="p-3 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-colors"
        >
          <SendHorizonal className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default RoomsPage;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRooms, useRoomMessages } from '../hooks/useFirestore';
import { ChatInterface } from '../components/ui/chat-interface';
import ThemeToggle from '../components/ThemeToggle';

const RoomChatPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { currentUser, userProfile, logout } = useAuth();
  const { rooms, loading: roomsLoading } = useRooms();
  const { messages, loading: messagesLoading, sendMessage } = useRoomMessages(roomId || '');
  const navigate = useNavigate();

  const room = rooms.find(r => r.id === roomId);
  const isMember = currentUser && room ? room.members.includes(currentUser.uid) : false;

  const handleSendMessage = async (content: string, type?: 'text' | 'image' | 'video' | 'file', attachment?: any) => {
    if (!currentUser) return;
    
    try {
      await sendMessage(content, currentUser.uid, type, attachment);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (roomsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading room...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Room not found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The room you're looking for doesn't exist.</p>
          <motion.button
            onClick={() => navigate('/rooms')}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
            whileHover={{ scale: 1.05 }}
          >
            Back to Rooms
          </motion.button>
        </div>
      </div>
    );
  }

  if (!isMember) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{room.name}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{room.description}</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
            You need to join this room to participate in the conversation.
          </p>
          <div className="flex gap-4">
            <motion.button
              onClick={() => navigate('/rooms')}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              Back
            </motion.button>
            <motion.button
              onClick={() => navigate('/rooms')}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              Join Room
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  // Mock messages for demo
  const mockMessages = [
    {
      id: '1',
      user: {
        name: 'Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face',
        isOnline: true,
        role: 'Developer'
      },
      content: 'Hey everyone! Just pushed the latest updates to the project repo. The new authentication system is working great!',
      timestamp: '2:30 PM'
    },
    {
      id: '2',
      user: {
        name: 'Marcus Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
        isOnline: true,
        role: 'Product Manager'
      },
      content: 'Awesome work Sarah! I tested it on my end and everything looks smooth. Ready for the demo tomorrow?',
      timestamp: '2:32 PM'
    },
    {
      id: '3',
      user: {
        name: 'Alex Kim',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        isOnline: false,
        role: 'Designer'
      },
      content: 'I\'ve updated the design mockups based on yesterday\'s feedback. Check them out when you get a chance!',
      timestamp: '2:35 PM',
      type: 'image' as const,
      attachment: {
        url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=300&fit=crop',
        name: 'design-mockups.png',
        type: 'image/png'
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => navigate('/rooms')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </motion.button>
              
              <div className="flex items-center gap-3">
                <img src="/logofinal.png" alt="EarnBuddy" className="w-8 h-8" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">{room.name}</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{room.members.length} members</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <motion.button
                onClick={handleLogout}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                Logout
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Interface */}
      <div className="container mx-auto px-6 py-6 h-[calc(100vh-88px)]">
        <ChatInterface
          roomName={room.name}
          roomId={roomId!}
          members={room.members.length}
          onlineMembers={Math.floor(room.members.length * 0.6)}
        />
      </div>
    </div>
  );
};

export default RoomChatPage;
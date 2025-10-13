import React from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRooms } from '../hooks/useFirestore';
import { ChatInterface } from '../components/ui/chat-interface';
// Removed extra tools to declutter room UI
import DashboardNavbar from '../components/DashboardNavbar';

const RoomChatPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { currentUser } = useAuth();
  const { rooms, loading: roomsLoading } = useRooms();
  const navigate = useNavigate();
  // Removed timeline/meetings/whiteboard UI state to simplify layout

  const room = rooms.find(r => r.id === roomId);
  const isMember = currentUser && room ? room.members.includes(currentUser.uid) : false;

  // Removed placeholder data for timeline and meetings


  // Removed logout handler here; handled globally in navbar

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



  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">

      <DashboardNavbar />

      {/* Real-time Chat Interface */}
      <div className="container mx-auto px-6 py-6 h-[calc(100vh-80px)]">
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => navigate('/community')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </motion.button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{room.name}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">{room.members.length} members</p>
            </div>

            {/* Room Tools removed for a cleaner chat-focused UI */}
          </div>
        </div>

        {/* Full-width chat area for less congested layout */}
        <div className="h-[calc(100%-60px)]">
          <ChatInterface
            roomName={room.name}
            roomId={roomId!}
            members={room.members.length}
            onlineMembers={Math.floor(room.members.length * 0.6)}
          />
        </div>
      </div>

      {/* Removed auxiliary modals to keep focus on chat */}
    </div>
  );
};

export default RoomChatPage;
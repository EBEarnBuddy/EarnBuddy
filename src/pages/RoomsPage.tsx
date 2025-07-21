import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  Hash, 
  Lock, 
  Globe, 
  Users, 
  MessageCircle,
  Clock,
  Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRooms } from '../hooks/useFirestore';
import { RoomCard } from '../components/ui/room-card';
import { Skeleton } from '../components/ui/skeleton';

const RoomsPage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { rooms, loading, createRoom, joinRoom } = useRooms();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoom, setNewRoom] = useState({
    name: '',
    description: '',
    isPrivate: false
  });

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateRoom = async () => {
    if (!newRoom.name.trim() || !currentUser) return;
    
    try {
      await createRoom({
        name: newRoom.name,
        description: newRoom.description,
        members: [currentUser.uid],
        createdBy: currentUser.uid,
        isPrivate: newRoom.isPrivate,
        messages: []
      });
      setNewRoom({ name: '', description: '', isPrivate: false });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    try {
      await joinRoom(roomId);
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  const handleEnterRoom = (roomId: string) => {
    navigate(`/room/${roomId}`);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => navigate('/discover')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </motion.button>
              
              <div className="flex items-center gap-3">
                <img src="/logofinal.png" alt="EarnBuddy" className="w-8 h-8" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rooms</h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
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

      <div className="container mx-auto px-6 py-8">
        {/* Search and Create */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-8">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>

          <motion.button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-5 h-5" />
            Create Room
          </motion.button>
        </div>

        {/* Rooms Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <Skeleton className="w-16 h-16 rounded-xl" />
                  <Skeleton className="w-6 h-6" />
                </div>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex justify-between items-center mb-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredRooms.map((room, index) => {
                const isJoined = currentUser ? room.members.includes(currentUser.uid) : false;
                
                return (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <RoomCard
                      room={{
                        id: room.id!,
                        name: room.name,
                        description: room.description,
                        members: room.members.length,
                        isPrivate: room.isPrivate,
                        lastActivity: 'Active now',
                        gradient: 'from-emerald-500 to-emerald-600',
                        isJoined,
                        unreadMessages: Math.floor(Math.random() * 5) // Mock unread count
                      }}
                      onJoin={handleJoinRoom}
                      onEnter={handleEnterRoom}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {!loading && filteredRooms.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No rooms found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Create your first room to start collaborating!'}
            </p>
            <motion.button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Create First Room
            </motion.button>
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create New Room</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Room Name
                  </label>
                  <input
                    type="text"
                    value={newRoom.name}
                    onChange={(e) => setNewRoom(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter room name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newRoom.description}
                    onChange={(e) => setNewRoom(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 resize-none"
                    rows={3}
                    placeholder="Describe your room"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={newRoom.isPrivate}
                    onChange={(e) => setNewRoom(prev => ({ ...prev, isPrivate: e.target.checked }))}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <label htmlFor="isPrivate" className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Private Room
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <motion.button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleCreateRoom}
                  disabled={!newRoom.name.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: newRoom.name.trim() ? 1.02 : 1 }}
                  whileTap={{ scale: newRoom.name.trim() ? 0.98 : 1 }}
                >
                  Create Room
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoomsPage;
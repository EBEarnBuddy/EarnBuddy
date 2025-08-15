import React, { FC, useState, useEffect, Fragment, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, PlusCircle, X, AlertCircle, UserPlus, CheckCircle } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { useAuth } from './App';

// ⚡ IMPORTANT: This URL must match the port of your backend server
const BASE_URL = 'http://127.0.0.1:8000';

// Define the type for a room, based on your backend model
interface Room {
  _id: string; // MongoDB uses _id
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  members: string[]; // Add the members field to the interface
}

interface RoomListProps {
  onSelectRoom: (room: { id: string; name: string }) => void;
}

const RoomList: FC<RoomListProps> = ({ onSelectRoom }) => {
  const { currentUser } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  // Fetch initial rooms when the component mounts or the user changes
  useEffect(() => {
    if (!currentUser) return;

    const fetchRooms = async () => {
      setLoading(true);
      try {
        const idToken = await currentUser.getIdToken();

        // ⚡ CHANGE: Fetch from the root /rooms endpoint to get all public and joined rooms
        const response = await fetch(`${BASE_URL}/rooms`, {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });

        if (response.status === 403) {
          throw new Error('You are not authorized to view this content.');
        }

        if (!response.ok) {
          throw new Error('Failed to fetch rooms.');
        }
        
        const data = await response.json();
        setRooms(data);
      } catch (error: any) {
        console.error('Error fetching rooms:', error);
        setCreateError(error.message || 'Failed to fetch rooms. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [currentUser]);

  // Handle the creation of a new room
  const handleCreateRoom = async (e: FormEvent) => {
    e.preventDefault();
    setCreateError('');
    if (newRoomName.trim() === '' || !currentUser) return;
    setCreateLoading(true);
    
    const roomPayload = {
      name: newRoomName,
      description: newRoomDescription,
      createdBy: currentUser.uid,
    };
    
    try {
      const idToken = await currentUser.getIdToken();
      if (!idToken) throw new Error('User not authenticated.');

      const response = await fetch(`${BASE_URL}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(roomPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create room on the server.');
      }
      
      const newRoom = await response.json();
      setRooms(prevRooms => [...prevRooms, newRoom]);
      setNewRoomName('');
      setNewRoomDescription('');
      setIsModalOpen(false);

    } catch (error: any) {
      console.error('Error creating room:', error);
      setCreateError(error.message);
    } finally {
      setCreateLoading(false);
    }
  };

  // ⚡ NEW: Handle joining an existing room
  const handleJoinRoom = async (roomId: string) => {
    if (!currentUser) return;
    try {
        const idToken = await currentUser.getIdToken();
        const response = await fetch(`${BASE_URL}/rooms/${roomId}/join`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${idToken}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to join room.');
        }

        // Update the rooms list with the newly joined room
        const updatedRoom = await response.json();
        setRooms(prevRooms => prevRooms.map(room => 
            room._id === updatedRoom._id ? updatedRoom : room
        ));
        
        // After joining, automatically select the room
        onSelectRoom({ id: updatedRoom._id, name: updatedRoom.name });

    } catch (error: any) {
        console.error('Error joining room:', error);
        setCreateError(error.message);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">All Rooms</h2>
        <motion.button
          onClick={() => setIsModalOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-full shadow-md hover:bg-emerald-700 transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          <span>New Room</span>
        </motion.button>
      </div>

      {createError && (
        <div className="flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{createError}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 p-8">
          <p>No rooms found. Be the first to create one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => {
            // ⚡ NEW: Check if the current user is a member of this room
            const isMember = currentUser && room.members.includes(currentUser.uid);

            return (
              <motion.div
                key={room._id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg transition-transform flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                      <MessageSquare className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{room.name}</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{room.description}</p>
                </div>
                
                {/* ⚡ NEW: Conditionally render the button based on membership */}
                <div className="mt-4">
                  {isMember ? (
                    <motion.button
                      onClick={() => onSelectRoom({ id: room._id, name: room.name })}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg font-medium transition-colors"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>Already Joined</span>
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={() => handleJoinRoom(room._id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg shadow-md hover:bg-emerald-700 transition-colors"
                    >
                      <UserPlus className="w-5 h-5" />
                      <span>Join Room</span>
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* New Room Creation Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100"
                  >
                    Create a New Room
                  </Dialog.Title>
                  {createError && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mt-4"
                    >
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-sm">{createError}</span>
                    </motion.div>
                  )}
                  <form onSubmit={handleCreateRoom} className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Room Name</label>
                      <input
                        type="text"
                        value={newRoomName}
                        onChange={(e) => setNewRoomName(e.target.value)}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                      <textarea
                        value={newRoomDescription}
                        onChange={(e) => setNewRoomDescription(e.target.value)}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <motion.button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={createLoading}
                        className="inline-flex justify-center rounded-lg border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none disabled:opacity-50"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={createLoading}
                        className="inline-flex justify-center rounded-lg border border-transparent bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none disabled:opacity-50"
                      >
                        {createLoading ? 'Creating...' : 'Create'}
                      </motion.button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default RoomList;

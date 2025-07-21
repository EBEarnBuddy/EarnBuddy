import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRooms, useRoomMessages } from '../hooks/useFirestore';
import { ChatInterface } from '../components/ui/chat-interface';
import { Whiteboard } from '../components/ui/whiteboard';
import { TimelineTracker } from '../components/ui/timeline-tracker';
import { MeetingScheduler } from '../components/ui/meeting-scheduler';
import DashboardNavbar from '../components/DashboardNavbar';

const RoomChatPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { currentUser, userProfile, logout } = useAuth();
  const { rooms, loading: roomsLoading } = useRooms();
  const { messages, loading: messagesLoading, sendMessage } = useRoomMessages(roomId || '');
  const navigate = useNavigate();
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showMeetings, setShowMeetings] = useState(false);

  const room = rooms.find(r => r.id === roomId);
  const isMember = currentUser && room ? room.members.includes(currentUser.uid) : false;

  // Mock data for timeline and meetings
  const timelineItems = [
    {
      id: '1',
      title: 'Project Kickoff',
      description: 'Initial team meeting and project planning',
      status: 'completed' as const,
      dueDate: '2025-01-15',
      priority: 'high' as const,
      type: 'milestone' as const
    },
    {
      id: '2',
      title: 'Design Review',
      description: 'Review and approve initial designs',
      status: 'in-progress' as const,
      dueDate: '2025-01-20',
      priority: 'medium' as const,
      type: 'task' as const
    },
    {
      id: '3',
      title: 'Development Sprint 1',
      description: 'Complete core functionality development',
      status: 'pending' as const,
      dueDate: '2025-01-30',
      priority: 'high' as const,
      type: 'milestone' as const
    }
  ];

  const meetings = [
    {
      id: '1',
      title: 'Daily Standup',
      description: 'Quick sync on progress and blockers',
      date: '2025-01-21',
      time: '09:00',
      duration: 15,
      type: 'video' as const,
      attendees: ['user1', 'user2', 'user3'],
      status: 'scheduled' as const
    },
    {
      id: '2',
      title: 'Sprint Planning',
      description: 'Plan next sprint and assign tasks',
      date: '2025-01-22',
      time: '14:00',
      duration: 90,
      type: 'video' as const,
      attendees: ['user1', 'user2', 'user3', 'user4'],
      status: 'scheduled' as const
    }
  ];

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
            
            {/* Room Tools */}
            <div className="ml-auto flex items-center gap-2">
              <motion.button
                onClick={() => setShowTimeline(true)}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                whileHover={{ scale: 1.05 }}
              >
                Timeline
              </motion.button>
              <motion.button
                onClick={() => setShowMeetings(true)}
                className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                whileHover={{ scale: 1.05 }}
              >
                Meetings
              </motion.button>
              <motion.button
                onClick={() => setShowWhiteboard(true)}
                className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
                whileHover={{ scale: 1.05 }}
              >
                Whiteboard
              </motion.button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100%-60px)]">
          {/* Main Chat */}
          <div className="lg:col-span-3">
            <ChatInterface
              roomName={room.name}
              roomId={roomId!}
              members={room.members.length}
              onlineMembers={Math.floor(room.members.length * 0.6)}
            />
          </div>
          
          {/* Side Panel */}
          <div className="lg:col-span-1 space-y-4 overflow-y-auto">
            {/* Quick Timeline */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Timeline</h4>
              <div className="space-y-2">
                {timelineItems.slice(0, 3).map(item => (
                  <div key={item.id} className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${
                      item.status === 'completed' ? 'bg-green-500' :
                      item.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-400'
                    }`}></div>
                    <span className="text-gray-700 dark:text-gray-300">{item.title}</span>
                  </div>
                ))}
              </div>
              <motion.button
                onClick={() => setShowTimeline(true)}
                className="w-full mt-3 py-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors text-sm"
                whileHover={{ scale: 1.02 }}
              >
                View Full Timeline
              </motion.button>
            </div>

            {/* Upcoming Meetings */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Next Meeting</h4>
              {meetings.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900 dark:text-white">{meetings[0].title}</p>
                    <p className="text-gray-600 dark:text-gray-400">{meetings[0].date} at {meetings[0].time}</p>
                  </div>
                  <motion.button
                    onClick={() => setShowMeetings(true)}
                    className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    whileHover={{ scale: 1.02 }}
                  >
                    View All Meetings
                  </motion.button>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No upcoming meetings</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Whiteboard
        isOpen={showWhiteboard}
        onClose={() => setShowWhiteboard(false)}
        roomName={room.name}
        collaborators={room.members}
      />

      <AnimatePresence>
        {showTimeline && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTimeline(false)}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Project Timeline</h3>
                <button
                  onClick={() => setShowTimeline(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <TimelineTracker
                  projectName={room.name}
                  items={timelineItems}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMeetings && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMeetings(false)}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Meeting Scheduler</h3>
                <button
                  onClick={() => setShowMeetings(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <MeetingScheduler
                  meetings={meetings}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoomChatPage;
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Video,
  Users,
  Plus,
  X,
  MapPin,
  Link,
  Bell,
  Copy,
  Send,
  Settings,
  Mic,
  Camera,
  Monitor,
  Phone
} from 'lucide-react';

interface Meeting {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number;
  type: 'video' | 'audio' | 'in-person';
  attendees: string[];
  location?: string;
  meetingLink?: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
}

interface MeetingSchedulerProps {
  meetings: Meeting[];
  onScheduleMeeting?: (meeting: Omit<Meeting, 'id' | 'status'>) => void;
  onJoinMeeting?: (meetingId: string) => void;
}

export const MeetingScheduler: React.FC<MeetingSchedulerProps> = ({
  meetings,
  onScheduleMeeting,
  onJoinMeeting
}) => {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showMeetingRoom, setShowMeetingRoom] = useState(false);
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 60,
    type: 'video' as const,
    attendees: [] as string[],
    location: '',
    meetingLink: ''
  });

  const upcomingMeetings = meetings.filter(m => m.status === 'scheduled');
  const ongoingMeetings = meetings.filter(m => m.status === 'ongoing');

  const handleScheduleMeeting = () => {
    if (onScheduleMeeting && newMeeting.title.trim()) {
      onScheduleMeeting(newMeeting);
      setNewMeeting({
        title: '',
        description: '',
        date: '',
        time: '',
        duration: 60,
        type: 'video',
        attendees: [],
        location: '',
        meetingLink: ''
      });
      setShowScheduleModal(false);
    }
  };

  const handleJoinMeeting = (meeting: Meeting) => {
    setActiveMeeting(meeting);
    setShowMeetingRoom(true);
    if (onJoinMeeting) {
      onJoinMeeting(meeting.id);
    }
  };

  const getMeetingTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'audio': return Phone;
      case 'in-person': return MapPin;
      default: return Video;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'scheduled': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'completed': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-emerald-600" />
            Meetings
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {upcomingMeetings.length} upcoming • {ongoingMeetings.length} ongoing
          </p>
        </div>

        <motion.button
          onClick={() => setShowScheduleModal(true)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
        >
          <Plus className="w-4 h-4" />
          Schedule
        </motion.button>
      </div>

      {/* Ongoing Meetings */}
      {ongoingMeetings.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Ongoing Meetings
          </h4>
          <div className="space-y-3">
            {ongoingMeetings.map(meeting => {
              const TypeIcon = getMeetingTypeIcon(meeting.type);
              return (
                <motion.div
                  key={meeting.id}
                  className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <TypeIcon className="w-5 h-5 text-green-600" />
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white">{meeting.title}</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {meeting.attendees.length} attendees • Started at {meeting.time}
                        </p>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => handleJoinMeeting(meeting)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      whileHover={{ scale: 1.05 }}
                    >
                      Join
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming Meetings */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {upcomingMeetings.map((meeting, index) => {
          const TypeIcon = getMeetingTypeIcon(meeting.type);

          return (
            <motion.div
              key={meeting.id}
              className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:shadow-md transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ y: -2 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <TypeIcon className="w-5 h-5 text-emerald-600 mt-1" />

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{meeting.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                        {meeting.status}
                      </span>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{meeting.description}</p>

                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {meeting.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {meeting.time} ({meeting.duration}m)
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {meeting.attendees.length} attendees
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Copy className="w-4 h-4 text-gray-500" />
                  </motion.button>
                  <motion.button
                    onClick={() => handleJoinMeeting(meeting)}
                    className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
                    whileHover={{ scale: 1.05 }}
                  >
                    Join
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {upcomingMeetings.length === 0 && ongoingMeetings.length === 0 && (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No meetings scheduled</p>
        </div>
      )}

      {/* Schedule Meeting Modal */}
      <AnimatePresence>
        {showScheduleModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowScheduleModal(false)}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Schedule Meeting</h3>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meeting Title
                  </label>
                  <input
                    type="text"
                    value={newMeeting.title}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter meeting title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newMeeting.description}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Meeting agenda or description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={newMeeting.date}
                      onChange={(e) => setNewMeeting(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Time
                    </label>
                    <input
                      type="time"
                      value={newMeeting.time}
                      onChange={(e) => setNewMeeting(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Duration (minutes)
                    </label>
                    <select
                      value={newMeeting.duration}
                      onChange={(e) => setNewMeeting(prev => ({ ...prev, duration: Number(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={90}>1.5 hours</option>
                      <option value={120}>2 hours</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type
                    </label>
                    <select
                      value={newMeeting.type}
                      onChange={(e) => setNewMeeting(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="video">Video Call</option>
                      <option value="audio">Audio Call</option>
                      <option value="in-person">In Person</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <motion.button
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleScheduleMeeting}
                  disabled={!newMeeting.title.trim() || !newMeeting.date || !newMeeting.time}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Schedule
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Meeting Room Modal */}
      <AnimatePresence>
        {showMeetingRoom && activeMeeting && (
          <motion.div
            className="fixed inset-0 bg-black z-50 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Meeting Header */}
            <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold">{activeMeeting.title}</h2>
                <p className="text-sm text-gray-300">{activeMeeting.attendees.length} participants</p>
              </div>
              <motion.button
                onClick={() => setShowMeetingRoom(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Video Grid */}
            <div className="flex-1 p-4 bg-gray-900">
              <div className="grid grid-cols-2 gap-4 h-full">
                <div className="bg-gray-800 rounded-xl flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-24 h-24 bg-emerald-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-2xl font-bold">You</span>
                    </div>
                    <p>Your Video</p>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-xl flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-24 h-24 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-2xl font-bold">SC</span>
                    </div>
                    <p>User</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Meeting Controls */}
            <div className="bg-gray-900 p-4 flex items-center justify-center gap-4">
              <motion.button
                className="p-4 bg-gray-700 hover:bg-gray-600 rounded-full text-white transition-colors"
                whileHover={{ scale: 1.1 }}
              >
                <Mic className="w-6 h-6" />
              </motion.button>
              <motion.button
                className="p-4 bg-gray-700 hover:bg-gray-600 rounded-full text-white transition-colors"
                whileHover={{ scale: 1.1 }}
              >
                <Camera className="w-6 h-6" />
              </motion.button>
              <motion.button
                className="p-4 bg-gray-700 hover:bg-gray-600 rounded-full text-white transition-colors"
                whileHover={{ scale: 1.1 }}
              >
                <Monitor className="w-6 h-6" />
              </motion.button>
              <motion.button
                onClick={() => setShowMeetingRoom(false)}
                className="p-4 bg-red-600 hover:bg-red-700 rounded-full text-white transition-colors"
                whileHover={{ scale: 1.1 }}
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, Paperclip, MoreVertical, Users, Hash, AtSign, Pin, Settings, Image, Video, Mic, File, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRoomChatMessages } from '../../hooks/useFirestore';

interface ChatInterfaceProps {
  roomName: string;
  roomId: string;
  members: number;
  onlineMembers: number;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  roomName, 
  roomId,
  members, 
  onlineMembers
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentUser, userProfile } = useAuth();
  const { messages, loading, sendMessage, addReaction } = useRoomChatMessages(roomId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!currentUser || !newMessage.trim()) return;
    
    try {
      if (selectedFile) {
        // Handle file upload
        const fileType = selectedFile.type.startsWith('image/') ? 'image' : 
                        selectedFile.type.startsWith('video/') ? 'video' : 'file';
        
        sendMessage(newMessage || `Shared a ${fileType}`, currentUser.uid, 
          userProfile?.displayName || currentUser.displayName || 'Anonymous', 
          userProfile?.photoURL || currentUser.photoURL || '', fileType, {
          file: selectedFile,
          url: previewUrl,
          name: selectedFile.name,
          type: selectedFile.type,
          size: formatFileSize(selectedFile.size)
        });
        setSelectedFile(null);
        setPreviewUrl(null);
      } else {
        sendMessage(newMessage, currentUser.uid, 
          userProfile?.displayName || currentUser.displayName || 'Anonymous',
          userProfile?.photoURL || currentUser.photoURL || '');
      }
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (type: 'image' | 'video' | 'file') => {
    const input = document.createElement('input');
    input.type = 'file';
    
    switch (type) {
      case 'image':
        input.accept = 'image/*';
        break;
      case 'video':
        input.accept = 'video/*';
        break;
      case 'file':
        input.accept = '*/*';
        break;
    }
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setSelectedFile(file);
        if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
          const url = URL.createObjectURL(file);
          setPreviewUrl(url);
        }
        setShowMediaOptions(false);
      }
    };
    
    input.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'Admin': return 'text-red-500';
      case 'Developer': return 'text-blue-500';
      case 'Product Manager': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!currentUser) return;
    try {
      await addReaction(messageId, emoji, currentUser.uid);
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const renderMessage = (message: any, index: number) => (
    <motion.div
      key={message.id}
      className="group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <div className="flex items-start gap-3 hover:bg-white/50 dark:hover:bg-gray-700/50 p-2 rounded-lg transition-colors">
        <div className="relative">
          <img
            src={message.senderAvatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"}
            alt={message.senderName || "User"}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
              {message.senderName || "User"}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatTimestamp(message.timestamp)}
            </span>
          </div>
          
          <div className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed mb-2">
            {message.content}
          </div>

          {/* Reactions */}
          {message.reactions && Object.keys(message.reactions).length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {Object.entries(message.reactions).map(([emoji, userIds]) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(message.id, emoji)}
                  className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 transition-colors ${
                    currentUser && userIds.includes(currentUser.uid)
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <span>{emoji}</span>
                  <span>{userIds.length}</span>
                </button>
              ))}
            </div>
          )}

          {/* Render attachment if present */}
          {message.attachment && (
            <div className="mt-2">
              {message.type === 'image' && (
                <img
                  src={message.attachment.url}
                  alt={message.attachment.name}
                  className="max-w-xs rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => window.open(message.attachment!.url, '_blank')}
                />
              )}
              {message.type === 'video' && (
                <video
                  src={message.attachment.url}
                  controls
                  className="max-w-xs rounded-lg shadow-md"
                >
                  Your browser does not support the video tag.
                </video>
              )}
              {message.type === 'file' && (
                <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg max-w-xs">
                  <File className="w-8 h-8 text-gray-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {message.attachment.name}
                    </p>
                    {message.attachment.size && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {message.attachment.size}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Reactions */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2">
            <div className="flex gap-1">
              {['👍', '❤️', '😄', '🎉', '🚀'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(message.id, emoji)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
    
    {/* Video Call Modal */}
    <AnimatePresence>
      {showVideoCall && (
        <motion.div
          className="fixed inset-0 bg-black z-50 flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Video Call Header */}
          <div className="flex items-center justify-between p-4 bg-gray-800 text-white">
            <div className="flex items-center gap-3">
              <Video className="w-6 h-6 text-emerald-400" />
              <div>
                <h2 className="font-semibold">{roomName} - Video Call</h2>
                <p className="text-sm text-gray-300">{onlineMembers} participants</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                <Monitor className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowVideoCall(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Video Grid */}
          <div className="flex-1 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
              {/* Main Video */}
              <div className="relative bg-gray-800 rounded-xl overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <img
                      src={userProfile?.photoURL || currentUser?.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face"}
                      alt="You"
                      className="w-24 h-24 rounded-full mx-auto mb-4"
                    />
                    <p className="text-white">You</p>
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-lg">
                  <span className="text-white text-sm font-medium">You</span>
                </div>
              </div>

              {/* Participant Video */}
              <div className="relative bg-gray-800 rounded-xl overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <img
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face"
                      alt="Participant"
                      className="w-24 h-24 rounded-full mx-auto mb-4"
                    />
                    <p className="text-white">Sarah Chen</p>
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-lg">
                  <span className="text-white text-sm font-medium">Sarah Chen</span>
                </div>
          {/* Video Controls */}
          <div className="p-4 bg-gray-800 flex items-center justify-center gap-4">
            <button className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors">
              <Mic className="w-6 h-6" />
            </button>
            <button className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors">
              <Video className="w-6 h-6" />
            </button>
            <button className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors">
              <Monitor className="w-6 h-6" />
            </button>
            <button
              onClick={() => setShowVideoCall(false)}
              className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
              </div>
    {/* Whiteboard Modal */}
    <AnimatePresence>
      {showWhiteboard && (
        <motion.div
          className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Whiteboard Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Edit3 className="w-6 h-6 text-emerald-600" />
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">{roomName} - Collaborative Whiteboard</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Draw, brainstorm, and collaborate in real-time</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm">
                Save Board
              </button>
              <button
                onClick={() => setShowWhiteboard(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
            </div>
          {/* Whiteboard Canvas */}
          <div className="flex-1 relative bg-white dark:bg-gray-800">
            <div className="absolute inset-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Edit3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">Collaborative Whiteboard</h3>
                <p className="text-gray-500 dark:text-gray-500">Start drawing, adding notes, or brainstorming ideas</p>
                <p className="text-sm text-gray-400 dark:text-gray-600 mt-2">Real-time collaboration coming soon!</p>
              </div>
            </div>
          </div>
          </div>
          {/* Whiteboard Tools */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-center gap-4">
              <button className="p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                ✏️ Pen
              </button>
              <button className="p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                🖍️ Marker
              </button>
              <button className="p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                🧽 Eraser
              </button>
              <button className="p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                📝 Text
              </button>
              <button className="p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                🔲 Shapes
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Smile, Video, Monitor, X, Mic, File } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { roomMessagesAPI, uploadAPI } from '../../lib/axios';

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
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // Typing indicators can be added later
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showVideoCall, setShowVideoCall] = useState(false);
  // Whiteboard is not used inside this component now
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingRef = useRef(false);
  const { currentUser, userProfile } = useAuth();

  // Load messages function with proper state management
  const loadMessages = useCallback(async (isInitialLoad = false) => {
    if (!roomId || isLoadingRef.current) {
      return;
    }

    try {
      isLoadingRef.current = true;

      if (isInitialLoad) {
        console.log('Initial loading messages for room:', roomId);
        setLoading(true);
      } else {
        console.log('Polling messages for room:', roomId);
      }

      const response = await roomMessagesAPI.getMessages(roomId, { limit: 100 });
      if (response.success) {
        setMessages(response.data.messages || []);
        console.log('Loaded messages:', response.data.messages?.length || 0);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [roomId]);

  // Load messages on component mount and when roomId changes
  useEffect(() => {
    console.log('RoomId changed to:', roomId);
    if (roomId) {
      loadMessages(true); // Initial load
    }
  }, [roomId, loadMessages]);

  // Set up polling - only start once when roomId is set
  useEffect(() => {
    if (!roomId) return;

    console.log('Starting message polling for room:', roomId);

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Start new interval after a delay to avoid immediate polling
    const timeoutId = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        loadMessages(false); // Polling load
      }, 5000); // Poll every 5 seconds
    }, 5000); // Wait 5 seconds before starting to poll

    // Cleanup function
    return () => {
      console.log('Stopping message polling');
      clearTimeout(timeoutId);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [roomId, loadMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) return;
    if (!currentUser) return;

    try {
      if (selectedFile) {
        // Handle file upload
        const fileType = selectedFile.type.startsWith('image/') ? 'image' :
                        selectedFile.type.startsWith('video/') ? 'video' : 'file';

        // Upload file first to get URL
        const uploadRes = await uploadAPI.uploadFile(selectedFile);
        const uploadedUrl = uploadRes?.data?.url || previewUrl;

        await roomMessagesAPI.sendMessage({
          roomId,
          content: newMessage || `Shared a ${fileType}`,
          senderId: currentUser!.uid,
          senderName: userProfile?.displayName || currentUser!.displayName || 'Anonymous',
          senderAvatar: userProfile?.photoURL || currentUser!.photoURL || '',
          type: fileType,
          attachment: {
            url: uploadedUrl,
            name: selectedFile.name,
            type: selectedFile.type,
            size: formatFileSize(selectedFile.size)
          }
        });
        setSelectedFile(null);
        setPreviewUrl(null);
      } else {
        await roomMessagesAPI.sendMessage({
          roomId,
          content: newMessage,
          senderId: currentUser!.uid,
          senderName: userProfile?.displayName || currentUser!.displayName || 'Anonymous',
          senderAvatar: userProfile?.photoURL || currentUser!.photoURL || '',
          type: 'text'
        });
      }
      setNewMessage('');

      // Reload messages to show the new message after a short delay
      setTimeout(() => {
        loadMessages(false);
      }, 1000);
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

    if (type === 'image') {
      input.accept = 'image/*';
    } else if (type === 'video') {
      input.accept = 'video/*';
    } else {
      input.accept = '*/*';
    }

    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        setSelectedFile(file);
        if (type === 'image' || type === 'video') {
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

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    // TODO: Implement reactions
    console.log('Reaction:', emoji, 'for message:', messageId);
  };

  const renderMessage = (message: any, index: number) => {
    const isOwnMessage = currentUser && message.senderId === currentUser.uid;

    return (
      <motion.div
        key={message._id || message.id}
        className={`group flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
        <div className={`flex items-start gap-3 max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* Avatar - only show for other users' messages */}
          {!isOwnMessage && (
            <div className="relative flex-shrink-0">
              <img
                src={message.senderAvatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"}
                alt={message.senderName || "User"}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white dark:border-gray-800"></div>
            </div>
          )}

          {/* Message Content */}
          <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
            {/* Sender Name - only show for other users' messages */}
            {!isOwnMessage && (
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-900 dark:text-gray-100 text-xs">
                  {message.senderName || "User"}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTimestamp(message.timestamp)}
                </span>
              </div>
            )}

            {/* Message Bubble */}
            <div className={`rounded-2xl px-4 py-2 max-w-full ${
              isOwnMessage
                ? 'bg-emerald-600 text-white rounded-br-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-md'
            }`}>
              <div className="text-sm leading-relaxed">
                {message.content}
              </div>

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
            </div>

            {/* Timestamp for own messages */}
            {isOwnMessage && (
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formatTimestamp(message.timestamp)}
              </span>
            )}

            {/* Quick Reactions - only show on hover */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2">
              <div className="flex gap-1">
                {['👍', '❤️', '😂', '😮', '😢', '😡'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(message._id || message.id, emoji)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-sm"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">{roomName}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{onlineMembers} online • {members} members</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowVideoCall(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Video className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          {/* Whiteboard button removed in simplified room UI */}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500 dark:text-gray-400">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-6xl text-gray-300 dark:text-gray-600 mb-4">#</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No messages yet</h3>
            <p className="text-gray-500 dark:text-gray-400">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => renderMessage(message, index))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        {/* Selected File Preview */}
        {selectedFile && (
          <div className="mb-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <File className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{selectedFile.name}</span>
              </div>
              <button
                onClick={removeSelectedFile}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-end gap-3">
          <div className="flex-1">
            <div className="relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="w-full p-3 pr-12 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />

              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <button
                  onClick={() => setShowMediaOptions(!showMediaOptions)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                >
                  <Paperclip className="w-4 h-4 text-gray-500" />
                </button>
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowMediaOptions(false);
                      setNewMessage(prev => prev + ' 🙂');
                    }}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                  >
                    <Smile className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>

            {/* Media Options */}
            <AnimatePresence>
              {showMediaOptions && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 md:w-auto w-full"
                >
                  <div className="flex gap-2 justify-between">
                    <button
                      onClick={() => handleFileSelect('image')}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm"
                    >
                      📷 Image
                    </button>
                    <button
                      onClick={() => handleFileSelect('video')}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm"
                    >
                      🎥 Video
                    </button>
                    <button
                      onClick={() => handleFileSelect('file')}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm"
                    >
                      📎 File
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() && !selectedFile}
            className="p-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

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
                      <p className="text-white">User</p>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-lg">
                    <span className="text-white text-sm font-medium">User</span>
                  </div>
                </div>
              </div>
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
  );
};
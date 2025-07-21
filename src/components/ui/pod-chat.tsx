import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Smile, 
  Paperclip, 
  MoreVertical, 
  Users, 
  Hash, 
  Pin, 
  Flag, 
  Heart,
  MessageCircle,
  Bookmark,
  Image as ImageIcon,
  X,
  ChevronDown,
  Search,
  Filter,
  UserPlus,
  Settings,
  Volume2,
  VolumeX,
  ArrowDown,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { FirestoreService } from '../../lib/firestore';

interface PodChatProps {
  pod: {
    id: string;
    name: string;
    description: string;
    members: string[];
    onlineMembers?: string[];
    theme: string;
    icon: string;
    messageCount?: number;
    pinnedMessages?: string[];
  };
  onClose?: () => void;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  type?: 'text' | 'image' | 'system';
  imageUrl?: string;
  reactions?: { [emoji: string]: string[] };
  isPinned?: boolean;
  isReported?: boolean;
  createdAt: any;
  isEdited?: boolean;
  editedAt?: any;
}

export const PodChat: React.FC<PodChatProps> = ({ pod, onClose }) => {
  const { currentUser, userProfile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMembersList, setShowMembersList] = useState(false);
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-time message subscription
  useEffect(() => {
    if (!pod.id) return;

    setLoading(true);
    const unsubscribe = FirestoreService.subscribeToPodPosts(pod.id, (posts) => {
      setMessages(posts);
      setLoading(false);
      
      // Update unread count if not at bottom
      if (!isAtBottom) {
        setUnreadCount(prev => prev + 1);
      }
    });

    return () => unsubscribe();
  }, [pod.id, isAtBottom]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
      setUnreadCount(0);
    }
  }, [messages, isAtBottom]);

  // Handle scroll detection
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setIsAtBottom(isNearBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    try {
      await createPost(newMessage, currentUser.uid);
      setNewMessage('');
      setIsAtBottom(true);
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

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!currentUser) return;
    
    try {
      await FirestoreService.addReactionToPost(messageId, emoji, currentUser.uid);
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handlePinMessage = async (messageId: string) => {
    try {
      await FirestoreService.pinPost(messageId, pod.id);
    } catch (error) {
      console.error('Error pinning message:', error);
    }
  };

  const handleReportMessage = async (messageId: string) => {
    if (!currentUser) return;
    
    try {
      await FirestoreService.reportPost(messageId, currentUser.uid, 'Inappropriate content');
    } catch (error) {
      console.error('Error reporting message:', error);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && currentUser) {
      // In a real app, you'd upload to storage first
      const imageUrl = URL.createObjectURL(file);
      FirestoreService.createPodPost(pod.id, currentUser.uid, newMessage || 'Shared an image', imageUrl);
      setNewMessage('');
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  const filteredMessages = searchTerm 
    ? messages.filter(msg => 
        msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.userName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : messages;

  const pinnedMessages = messages.filter(msg => msg.isPinned);

  const emojis = ['👍', '❤️', '😄', '🎉', '🚀', '👏', '🔥', '💯'];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 bg-gradient-to-r ${pod.theme} rounded-xl flex items-center justify-center`}>
            <Hash className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">{pod.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {pod.members.length} members • {pod.onlineMembers?.length || 0} online
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
          >
            <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </motion.button>

          <motion.button
            onClick={() => setShowPinnedMessages(!showPinnedMessages)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors relative"
            whileHover={{ scale: 1.05 }}
          >
            <Pin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            {pinnedMessages.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white text-xs rounded-full flex items-center justify-center">
                {pinnedMessages.length}
              </span>
            )}
          </motion.button>

          <motion.button
            onClick={() => setShowMembersList(!showMembersList)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
          >
            <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </motion.button>

          <motion.button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Volume2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </motion.button>

          {onClose && (
            <motion.button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search messages..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pinned Messages */}
      <AnimatePresence>
        {showPinnedMessages && pinnedMessages.length > 0 && (
          <motion.div
            className="p-4 border-b border-gray-200 dark:border-gray-700 bg-yellow-50 dark:bg-yellow-900/20"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2 flex items-center gap-2">
              <Pin className="w-4 h-4" />
              Pinned Messages
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {pinnedMessages.map(msg => (
                <div key={msg.id} className="text-sm text-yellow-700 dark:text-yellow-300 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded">
                  <span className="font-medium">{msg.userName}:</span> {msg.content}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <MessageCircle className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'No messages found' : 'No messages yet. Start the conversation!'}
            </p>
          </div>
        ) : (
          filteredMessages.map((message, index) => (
            <motion.div
              key={message.id}
              className="group relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors">
                <img
                  src={message.userAvatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"}
                  alt={message.userName}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                      {message.userName}
                    </span>
                    {message.isPinned && (
                      <Pin className="w-3 h-3 text-yellow-500" />
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTimestamp(message.createdAt)}
                    </span>
                    {message.isEdited && (
                      <span className="text-xs text-gray-400">(edited)</span>
                    )}
                  </div>
                  
                  <div className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed mb-2">
                    {message.content}
                  </div>

                  {message.imageUrl && (
                    <img
                      src={message.imageUrl}
                      alt="Shared image"
                      className="max-w-xs rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow mb-2"
                      onClick={() => window.open(message.imageUrl, '_blank')}
                    />
                  )}

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

                  {/* Quick Reactions */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      {emojis.slice(0, 5).map(emoji => (
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

                {/* Message Actions */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="relative">
                    <button
                      onClick={() => setSelectedMessage(selectedMessage === message.id ? null : message.id)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>

                    <AnimatePresence>
                      {selectedMessage === message.id && (
                        <motion.div
                          className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-20 min-w-32"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                        >
                          <button
                            onClick={() => {
                              handlePinMessage(message.id);
                              setSelectedMessage(null);
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <Pin className="w-4 h-4" />
                            Pin
                          </button>
                          <button
                            onClick={() => {
                              handleReportMessage(message.id);
                              setSelectedMessage(null);
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600"
                          >
                            <Flag className="w-4 h-4" />
                            Report
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to Bottom Button */}
      <AnimatePresence>
        {!isAtBottom && (
          <motion.button
            onClick={scrollToBottom}
            className="absolute bottom-20 right-4 bg-emerald-600 text-white p-3 rounded-full shadow-lg hover:bg-emerald-700 transition-colors z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
          >
            <ArrowDown className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <div className="relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${pod.name}...`}
                className="w-full px-4 py-3 pr-12 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
              
              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <ImageIcon className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <Smile className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Emoji Picker */}
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  className="absolute bottom-16 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 z-20"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <div className="grid grid-cols-8 gap-1">
                    {emojis.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => {
                          setNewMessage(prev => prev + emoji);
                          setShowEmojiPicker(false);
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: newMessage.trim() ? 1.05 : 1 }}
            whileTap={{ scale: newMessage.trim() ? 0.95 : 1 }}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* Members Sidebar */}
      <AnimatePresence>
        {showMembersList && (
          <motion.div
            className="absolute top-0 right-0 w-80 h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 z-30"
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900 dark:text-white">Members</h4>
                <button
                  onClick={() => setShowMembersList(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="space-y-3">
                {pod.members.slice(0, 10).map((memberId, index) => (
                  <div key={memberId} className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={`https://images.unsplash.com/photo-${1472099645785 + index}?w=32&h=32&fit=crop&crop=face`}
                        alt="Member"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      {pod.onlineMembers?.includes(memberId) && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Member {index + 1}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {pod.onlineMembers?.includes(memberId) ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {(showEmojiPicker || selectedMessage || showMembersList) && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            setShowEmojiPicker(false);
            setSelectedMessage(null);
            setShowMembersList(false);
          }}
        />
      )}
    </div>
  );
};
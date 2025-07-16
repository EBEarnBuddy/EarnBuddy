import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, Paperclip, MoreVertical, Users, Hash, AtSign, Pin, Settings, Image, Video, Mic, File, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Message {
  id: string;
  user: {
    name: string;
    avatar: string;
    isOnline?: boolean;
    role?: string;
  };
  content: string;
  timestamp: string;
  type?: 'text' | 'image' | 'video' | 'file';
  attachment?: {
    url: string;
    name: string;
    type: string;
    size?: string;
  };
}

interface ChatInterfaceProps {
  roomName: string;
  members: number;
  onlineMembers: number;
  messages?: Message[];
  onSendMessage?: (content: string, type?: 'text' | 'image' | 'video' | 'file', attachment?: any) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  roomName, 
  members, 
  onlineMembers,
  messages = [],
  onSendMessage
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>(['Lisa']);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentUser } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if ((newMessage.trim() || selectedFile) && onSendMessage) {
      if (selectedFile) {
        // Handle file upload
        const fileType = selectedFile.type.startsWith('image/') ? 'image' : 
                        selectedFile.type.startsWith('video/') ? 'video' : 'file';
        onSendMessage(newMessage || `Shared a ${fileType}`, fileType, {
          file: selectedFile,
          url: previewUrl,
          name: selectedFile.name,
          type: selectedFile.type,
          size: formatFileSize(selectedFile.size)
        });
        setSelectedFile(null);
        setPreviewUrl(null);
      } else {
        onSendMessage(newMessage);
      }
      setNewMessage('');
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

  const renderMessage = (message: Message, index: number) => (
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
            src={message.user?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"}
            alt={message.user?.name || "User"}
            className="w-10 h-10 rounded-full object-cover"
          />
          {message.user?.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
              {message.user?.name || "User"}
            </span>
            {message.user?.role && (
              <span className={`text-xs font-medium ${getRoleColor(message.user.role)}`}>
                {message.user.role}
              </span>
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {message.timestamp}
            </span>
          </div>
          
          <div className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed mb-2">
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
      </div>
    </motion.div>
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-emerald-500/20 overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 p-4 text-white border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{roomName}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span>{members} members</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>{onlineMembers} online</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Pin className="w-5 h-5" />
            </motion.button>
            <motion.button
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Users className="w-5 h-5" />
            </motion.button>
            <motion.button
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Settings className="w-5 h-5" />
            </motion.button>
            <motion.button
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <MoreVertical className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
        <AnimatePresence>
          {messages.length > 0 ? (
            messages.map((message, index) => renderMessage(message, index))
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <Hash className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-center">
                No messages yet. Start the conversation!
              </p>
            </div>
          )}
        </AnimatePresence>
        
        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <motion.div
            className="flex items-center gap-3 px-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </span>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* File Preview */}
      {selectedFile && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg">
            <div className="flex-1">
              {previewUrl && selectedFile.type.startsWith('image/') && (
                <img src={previewUrl} alt="Preview" className="w-16 h-16 object-cover rounded" />
              )}
              {previewUrl && selectedFile.type.startsWith('video/') && (
                <video src={previewUrl} className="w-16 h-16 object-cover rounded" />
              )}
              {!previewUrl && (
                <File className="w-16 h-16 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
            </div>
            <motion.button
              onClick={removeSelectedFile}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message #${roomName.toLowerCase().replace(/\s+/g, '-')}`}
              className="w-full px-4 py-3 pr-20 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <div className="relative">
                <motion.button
                  onClick={() => setShowMediaOptions(!showMediaOptions)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Paperclip className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </motion.button>
                
                {/* Media Options Dropdown */}
                <AnimatePresence>
                  {showMediaOptions && (
                    <motion.div
                      className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 min-w-[150px]"
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.button
                        onClick={() => handleFileSelect('image')}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        <Image className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Image</span>
                      </motion.button>
                      <motion.button
                        onClick={() => handleFileSelect('video')}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        <Video className="w-4 h-4 text-purple-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Video</span>
                      </motion.button>
                      <motion.button
                        onClick={() => handleFileSelect('file')}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        <File className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">File</span>
                      </motion.button>
                      <motion.button
                        onClick={() => {
                          // TODO: Implement voice recording
                          setShowMediaOptions(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        <Mic className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Voice</span>
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <motion.button
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Smile className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </motion.button>
            </div>
          </div>
          
          <motion.button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() && !selectedFile}
            className="p-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: newMessage.trim() || selectedFile ? 1.05 : 1 }}
            whileTap={{ scale: newMessage.trim() || selectedFile ? 0.95 : 1 }}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Click outside to close media options */}
      {showMediaOptions && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowMediaOptions(false)}
        />
      )}
    </div>
  );
};
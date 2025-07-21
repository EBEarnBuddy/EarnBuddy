import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal,
  Send,
  Image as ImageIcon,
  Smile,
  Pin,
  Flag,
  Edit,
  Trash2,
  Eye,
  Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { FirestoreService, PodPost } from '../../lib/firestore';

interface PodFeedProps {
  pod: {
    id: string;
    name: string;
    theme: string;
  };
  posts: PodPost[];
  loading: boolean;
  onCreatePost: (content: string, imageUrl?: string) => void;
  onLikePost: (postId: string) => void;
  onBookmarkPost: (postId: string) => void;
}

export const PodFeed: React.FC<PodFeedProps> = ({ 
  pod, 
  posts, 
  loading, 
  onCreatePost, 
  onLikePost, 
  onBookmarkPost 
}) => {
  const { currentUser } = useAuth();
  const [newPost, setNewPost] = useState('');
  const [showComments, setShowComments] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreatePost = () => {
    if (!newPost.trim()) return;
    onCreatePost(newPost);
    setNewPost('');
  };

  const handleAddComment = async (postId: string) => {
    if (!newComment.trim() || !currentUser) return;
    
    try {
      await FirestoreService.addCommentToPost(postId, currentUser.uid, newComment);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleReaction = async (postId: string, emoji: string) => {
    if (!currentUser) return;
    
    try {
      await FirestoreService.addReactionToPost(postId, emoji, currentUser.uid);
    } catch (error) {
      console.error('Error adding reaction:', error);
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

  const emojis = ['👍', '❤️', '😄', '🎉', '🚀', '👏'];

  return (
    <div className="flex flex-col h-full">
      {/* Create Post */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex gap-3">
          <img
            src={currentUser?.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"}
            alt="Your avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder={`What's happening in ${pod.name}?`}
              className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              rows={3}
            />
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <ImageIcon className="w-5 h-5 text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <Smile className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <motion.button
                onClick={handleCreatePost}
                disabled={!newPost.trim()}
                className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: newPost.trim() ? 1.02 : 1 }}
                whileTap={{ scale: newPost.trim() ? 0.98 : 1 }}
              >
                Post
              </motion.button>
            </div>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
        />
      </div>

      {/* Posts Feed */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center p-6">
            <MessageCircle className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-gray-600 dark:text-gray-400">No posts yet. Be the first to share something!</p>
          </div>
        ) : (
          <div className="space-y-0">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                className="border-b border-gray-200 dark:border-gray-700 p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex gap-3">
                  <img
                    src={post.userAvatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"}
                    alt={post.userName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {post.userName}
                      </span>
                      {post.isPinned && (
                        <Pin className="w-4 h-4 text-yellow-500" />
                      )}
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatTimestamp(post.createdAt)}
                      </span>
                      {post.isEdited && (
                        <span className="text-xs text-gray-400">(edited)</span>
                      )}
                    </div>
                    
                    <div className="text-gray-800 dark:text-gray-200 mb-3 leading-relaxed">
                      {post.content}
                    </div>

                    {post.imageUrl && (
                      <img
                        src={post.imageUrl}
                        alt="Post image"
                        className="max-w-full h-auto rounded-lg shadow-md mb-3 cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => window.open(post.imageUrl, '_blank')}
                      />
                    )}

                    {/* Reactions */}
                    {post.reactions && Object.keys(post.reactions).length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {Object.entries(post.reactions).map(([emoji, userIds]) => (
                          <button
                            key={emoji}
                            onClick={() => handleReaction(post.id!, emoji)}
                            className={`px-2 py-1 rounded-full text-sm flex items-center gap-1 transition-colors ${
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

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => onLikePost(post.id!)}
                          className={`flex items-center gap-1 text-sm transition-colors ${
                            currentUser && post.likes.includes(currentUser.uid)
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${currentUser && post.likes.includes(currentUser.uid) ? 'fill-current' : ''}`} />
                          <span>{post.likes.length}</span>
                        </button>
                        
                        <button
                          onClick={() => setShowComments(showComments === post.id ? null : post.id!)}
                          className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.comments.length}</span>
                        </button>
                        
                        <button
                          onClick={() => onBookmarkPost(post.id!)}
                          className={`flex items-center gap-1 text-sm transition-colors ${
                            currentUser && post.bookmarks.includes(currentUser.uid)
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400'
                          }`}
                        >
                          <Bookmark className={`w-4 h-4 ${currentUser && post.bookmarks.includes(currentUser.uid) ? 'fill-current' : ''}`} />
                        </button>

                        <button className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Quick Reactions */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        {emojis.map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => handleReaction(post.id!, emoji)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Comments */}
                    <AnimatePresence>
                      {showComments === post.id && (
                        <motion.div
                          className="mt-4 space-y-3"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          {post.comments.map((comment, commentIndex) => (
                            <div key={comment.id} className="flex gap-2 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                              <img
                                src={comment.userAvatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"}
                                alt={comment.userName}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                    {comment.userName}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatTimestamp(comment.createdAt)}
                                  </span>
                                </div>
                                <p className="text-gray-800 dark:text-gray-200 text-sm">{comment.content}</p>
                              </div>
                            </div>
                          ))}
                          
                          {/* Add Comment */}
                          <div className="flex gap-2 pl-4">
                            <img
                              src={currentUser?.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"}
                              alt="Your avatar"
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div className="flex-1 flex gap-2">
                              <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Write a comment..."
                                className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                              />
                              <button
                                onClick={() => handleAddComment(post.id!)}
                                disabled={!newComment.trim()}
                                className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
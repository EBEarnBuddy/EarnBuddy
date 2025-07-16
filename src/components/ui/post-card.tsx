import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PostCardProps {
  post: {
    id: string;
    user: {
      name: string;
      avatar: string;
      badge?: string;
    };
    content: string;
    image?: string;
    timestamp: string;
    likes: number;
    replies: number;
    isLiked: boolean;
  };
  onLike: (postId: string) => void;
  onReply: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onLike, onReply }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.img
            src={post.user.avatar}
            alt={post.user.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
            whileHover={{ scale: 1.1 }}
          />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900">{post.user.name}</h4>
              {post.user.badge && (
                <span className="px-2 py-1 bg-gradient-to-r from-emerald-500 to-emerald-400 text-white text-xs rounded-full">
                  {post.user.badge}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{post.timestamp}</p>
          </div>
        </div>
        
        <motion.button
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </motion.button>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-800 leading-relaxed mb-3">{post.content}</p>
        {post.image && (
          <motion.img
            src={post.image}
            alt="Post content"
            className="w-full h-48 object-cover rounded-xl"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-6">
          <motion.button
            onClick={() => onLike(post.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300",
              post.isLiked
                ? "text-red-500 bg-red-50"
                : "text-gray-600 hover:text-red-500 hover:bg-red-50"
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Heart className={cn("w-4 h-4", post.isLiked && "fill-current")} />
            <span className="text-sm font-medium">{post.likes}</span>
          </motion.button>

          <motion.button
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{post.replies}</span>
            {showReplies ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </motion.button>

          <motion.button
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Share2 className="w-4 h-4" />
            <span className="text-sm font-medium">Share</span>
          </motion.button>
        </div>

        <AnimatePresence>
          {isHovered && (
            <motion.button
              onClick={() => onReply(post.id)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg text-sm font-medium"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Reply
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Replies Section */}
      <AnimatePresence>
        {showReplies && (
          <motion.div
            className="mt-4 pt-4 border-t border-gray-100"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-3">
              {/* Reply Input */}
              <div className="flex gap-3">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
                  alt="Your avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Write a reply..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
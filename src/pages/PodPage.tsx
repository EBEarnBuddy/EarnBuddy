import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  MessageCircle, 
  Plus, 
  Send, 
  Heart, 
  Share2, 
  Bookmark,
  MoreHorizontal,
  Image as ImageIcon,
  Smile,
  Hash,
  Settings,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePods, useEnhancedPodPosts } from '../hooks/useFirestore';
import { PostCard } from '../components/ui/post-card';
import { PodSidebar } from '../components/ui/pod-sidebar';
import { Skeleton } from '../components/ui/skeleton';
import ThemeToggle from '../components/ThemeToggle';

const PodPage: React.FC = () => {
  const { podId } = useParams<{ podId: string }>();
  const { currentUser, userProfile, logout } = useAuth();
  const { pods, loading: podsLoading } = usePods();
  const { posts, loading: postsLoading, createPost } = useEnhancedPodPosts(podId || '');
  const navigate = useNavigate();
  const [newPost, setNewPost] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);

  const pod = pods.find(p => p.id === podId);
  const isJoined = currentUser && pod ? pod.members.includes(currentUser.uid) : false;

  const handleCreatePost = async () => {
    if (!newPost.trim() || !currentUser) return;
    
    try {
      await createPost(newPost, currentUser.uid);
      setNewPost('');
      setShowCreatePost(false);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLikePost = async (postId: string) => {
    // TODO: Implement like functionality for enhanced posts
    console.log('Like post:', postId);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (podsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading pod...</p>
        </div>
      </div>
    );
  }

  if (!pod) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Pod not found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The pod you're looking for doesn't exist.</p>
          <motion.button
            onClick={() => navigate('/community')}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
            whileHover={{ scale: 1.05 }}
          >
            Back to Community
          </motion.button>
        </div>
      </div>
    );
  }

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className={`w-20 h-20 bg-gradient-to-r ${pod.theme} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
            <Hash className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{pod.name}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{pod.description}</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
            You need to join this pod to view its content.
          </p>
          <div className="flex gap-4">
            <motion.button
              onClick={() => navigate('/community')}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              Back
            </motion.button>
            <motion.button
              onClick={() => navigate('/community')}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              Join Pod
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => navigate('/community')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </motion.button>
              
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-gradient-to-r ${pod.theme} rounded-xl flex items-center justify-center`}>
                  <Hash className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">{pod.name}</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{pod.memberCount || pod.members.length} members</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <motion.button
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                <UserPlus className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </motion.button>
              <motion.button
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </motion.button>
              <ThemeToggle />
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

      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 max-w-4xl mx-auto p-6">
          {/* Create Post */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex items-start gap-4">
              <img
                src={userProfile?.photoURL || currentUser?.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"}
                alt="Your avatar"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder={`What's happening in ${pod.name}?`}
                  className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                  rows={3}
                />
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <motion.button
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      whileHover={{ scale: 1.1 }}
                    >
                      <ImageIcon className="w-5 h-5 text-gray-500" />
                    </motion.button>
                    <motion.button
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Smile className="w-5 h-5 text-gray-500" />
                    </motion.button>
                  </div>
                  <motion.button
                    onClick={handleCreatePost}
                    disabled={!newPost.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    whileHover={{ scale: newPost.trim() ? 1.05 : 1 }}
                    whileTap={{ scale: newPost.trim() ? 0.95 : 1 }}
                  >
                    <Send className="w-4 h-4" />
                    Post
                  </motion.button>
                </div>
              </div>
            </div>
          </div>

          {/* Posts Feed */}
          <div className="space-y-6">
            {postsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-4 mb-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-20 w-full mb-4" />
                  <div className="flex gap-6">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              ))
            ) : posts.length > 0 ? (
              posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <PostCard
                    post={{
                      id: post.id!,
                      user: {
                        name: post.userName || 'Anonymous User',
                        avatar: post.userAvatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
                        badge: 'Builder'
                      },
                      content: post.content,
                      image: post.imageUrl,
                      timestamp: post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleString() : 'Just now',
                      likes: post.likes.length,
                      replies: post.comments?.length || 0,
                      isLiked: currentUser ? post.likes.includes(currentUser.uid) : false
                    }}
                    onLike={handleLikePost}
                    onReply={(postId) => console.log('Reply to:', postId)}
                  />
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No posts yet</h3>
                <p className="text-gray-600 dark:text-gray-400">Be the first to start a conversation in this pod!</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block">
          <PodSidebar
            pod={{
              name: pod.name,
              description: pod.description,
              members: pod.memberCount || pod.members.length,
              onlineMembers: Math.floor((pod.memberCount || pod.members.length) * 0.3)
            }}
            activeRooms={[
              { id: '1', name: 'General Chat', members: 45, isActive: true },
              { id: '2', name: 'Project Ideas', members: 23, isActive: true },
              { id: '3', name: 'Resources', members: 67, isActive: false }
            ]}
            pinnedLinks={pod.pinnedResources || []}
            onCreateRoom={() => console.log('Create room')}
          />
        </div>
      </div>
    </div>
  );
};

export default PodPage;
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
  UserPlus,
  Bell,
  BellOff,
  Pin,
  Flag,
  Eye,
  Clock,
  TrendingUp,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePods, usePodPosts } from '../hooks/useFirestore';
import { PodChat } from '../components/ui/pod-chat';
import { PodFeed } from '../components/ui/pod-feed';
import { Skeleton } from '../components/ui/skeleton';

const PodPage: React.FC = () => {
  const { podId } = useParams<{ podId: string }>();
  const { currentUser, userProfile, logout } = useAuth();
  const { pods, loading: podsLoading } = usePods();
  const { posts, loading: postsLoading, createPost, likePost, unlikePost, bookmarkPost } = usePodPosts(podId || '');
  const navigate = useNavigate();
  const [showPodInfo, setShowPodInfo] = useState(false);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);

  const pod = pods.find(p => p.id === podId);
  const isJoined = currentUser && pod ? pod.members.includes(currentUser.uid) : false;

  const handleJoinPod = async (podId: string) => {
    // This would be implemented with the joinPod function from usePods
    console.log('Joining pod:', podId);
  };

  const handleCreatePost = async (content: string, imageUrl?: string) => {
    if (!currentUser) return;
    try {
      await createPost(content, currentUser.uid, imageUrl);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!currentUser) return;
    try {
      const post = posts.find(p => p.id === postId);
      if (post?.likes.includes(currentUser.uid)) {
        await unlikePost(postId, currentUser.uid);
      } else {
        await likePost(postId, currentUser.uid);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleBookmarkPost = async (postId: string) => {
    if (!currentUser) return;
    try {
      await bookmarkPost(postId, currentUser.uid);
    } catch (error) {
      console.error('Error bookmarking post:', error);
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
          
          {/* Pod Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {pod.memberCount || pod.members.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {pod.messageCount || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Messages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {pod.onlineMembers?.length || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Online</div>
            </div>
          </div>
          
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
              onClick={async () => {
                if (currentUser) {
                  await handleJoinPod(pod.id!);
                  // Refresh the page to show the pod content
                  window.location.reload();
                }
              }}
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
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>{pod.memberCount || pod.members.length} members</span>
                    <span>•</span>
                    <span>{pod.onlineMembers?.length || 0} online</span>
                    <span>•</span>
                    <span>{pod.messageCount || 0} messages</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => setIsNotificationEnabled(!isNotificationEnabled)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                {isNotificationEnabled ? (
                  <Bell className="w-5 h-5 text-emerald-600" />
                ) : (
                  <BellOff className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </motion.button>
              
              <motion.button
                onClick={() => setShowPodInfo(!showPodInfo)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </motion.button>
              
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

      {/* Pod Info Sidebar */}
      <AnimatePresence>
        {showPodInfo && (
          <motion.div
            className="fixed top-0 right-0 w-80 h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 z-50 overflow-y-auto"
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Pod Info</h3>
                <button
                  onClick={() => setShowPodInfo(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Description</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {pod.description}
                  </p>
                </div>
                
                {pod.tags && pod.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {pod.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Stats</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Members</span>
                      <span className="font-medium">{pod.memberCount || pod.members.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Messages</span>
                      <span className="font-medium">{pod.messageCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Online Now</span>
                      <span className="font-medium text-green-600">{pod.onlineMembers?.length || 0}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Recent Members</h4>
                  <div className="space-y-2">
                    {pod.members.slice(0, 5).map((memberId, index) => (
                      <div key={memberId} className="flex items-center gap-2">
                        <img
                          src={`https://images.unsplash.com/photo-${1472099645785 + index}?w=24&h=24&fit=crop&crop=face`}
                          alt="Member"
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Member {index + 1}
                        </span>
                        {pod.onlineMembers?.includes(memberId) && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Pod Feed */}
      <div className="h-[calc(100vh-88px)]">
        <PodFeed 
          pod={{
            id: pod.id!,
            name: pod.name,
            theme: pod.theme
          }}
          posts={posts}
          loading={postsLoading}
          onCreatePost={handleCreatePost}
          onLikePost={handleLikePost}
          onBookmarkPost={handleBookmarkPost}
        />
      </div>
    </div>
  );
};

export default PodPage;
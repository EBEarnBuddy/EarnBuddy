import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Hash, Settings, UserPlus, Bell, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePods, usePodPosts } from '../hooks/useFirestore';
import { PodFeed } from '../components/ui/pod-feed';
import DashboardNavbar from '../components/DashboardNavbar';

const PodPage: React.FC = () => {
  const { podId } = useParams<{ podId: string }>();
  const { currentUser } = useAuth();
  const { pods, loading: podsLoading, joinPod, leavePod } = usePods();
  const { posts, loading: postsLoading, createPost } = usePodPosts(podId || '');
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);

  const pod = pods.find(p => p.id === podId);
  const isMember = currentUser && pod ? pod.members.includes(currentUser.uid) : false;
  const isAdmin = currentUser && pod ? ((pod as any).creatorId === currentUser.uid || ((pod as any).moderators || []).includes(currentUser.uid)) : false;

  const handleJoinPod = async () => {
    if (!currentUser || !podId) return;
    try {
      await joinPod(podId, currentUser.uid);
    } catch (error) {
      console.error('Error joining pod:', error);
    }
  };

  const handleLeavePod = async () => {
    if (!currentUser || !podId) return;
    try {
      await leavePod(podId, currentUser.uid);
      navigate('/community');
    } catch (error) {
      console.error('Error leaving pod:', error);
    }
  };

  const handleCreatePost = async (content: string, imageUrl?: string) => {
    if (!currentUser || !isAdmin) return;
    try {
      await createPost(content, currentUser.uid, imageUrl);
    } catch (error) {
      console.error('Error creating post:', error);
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

  if (!isMember) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className={`w-20 h-20 bg-gradient-to-r ${pod.theme} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
            <Hash className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{pod.name}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{pod.description}</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
            You need to join this pod to see posts and participate.
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
              onClick={handleJoinPod}
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
      <DashboardNavbar />

      <div className="container mx-auto px-6 py-6 h-[calc(100vh-80px)]">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => navigate('/community')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </motion.button>
              <div className={`w-10 h-10 bg-gradient-to-r ${pod.theme} rounded-lg flex items-center justify-center`}>
                <Hash className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{pod.name}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">{pod.members.length} members</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => setShowSettings(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </motion.button>
              <motion.button
                onClick={handleLeavePod}
                className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium"
                whileHover={{ scale: 1.05 }}
              >
                Leave Pod
              </motion.button>
            </div>
          </div>
        </div>

        <PodFeed
          pod={{
            id: pod.id!,
            name: pod.name,
            theme: pod.theme
          }}
          posts={posts}
          loading={postsLoading}
          onCreatePost={handleCreatePost}
          onLikePost={() => {}}
          onBookmarkPost={() => {}}
          canPost={isAdmin}
        />
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Pod Settings</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white">Notifications</span>
                  </div>
                  <button className="p-2 bg-emerald-600 text-white rounded-lg">
                    <Bell className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <UserPlus className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white">Invite Members</span>
                  </div>
                  <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm">
                    Invite
                  </button>
                </div>
              </div>

              <motion.button
                onClick={() => setShowSettings(false)}
                className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Done
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PodPage;
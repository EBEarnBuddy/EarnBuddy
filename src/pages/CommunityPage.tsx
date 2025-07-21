import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  Zap, 
  Globe, 
  Cpu, 
  Leaf, 
  DollarSign,
  Palette,
  ArrowLeft,
  Star,
  MessageCircle,
  Hash,
  Eye,
  Clock,
  UserPlus,
  Settings,
  Bell,
  BellOff
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePods } from '../hooks/useFirestore';
import { PodCard } from '../components/ui/pod-card';
import { Skeleton } from '../components/ui/skeleton';

const CommunityPage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { pods, loading, joinPod, leavePod } = usePods();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'members'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = [
    { id: 'all', name: 'All Pods', icon: Globe },
    { id: 'ai', name: 'AI & ML', icon: Cpu },
    { id: 'web3', name: 'Web3', icon: Zap },
    { id: 'climate', name: 'Climate Tech', icon: Leaf },
    { id: 'fintech', name: 'FinTech', icon: DollarSign },
    { id: 'design', name: 'Design', icon: Palette }
  ];

  const getIconForPod = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'Cpu': Cpu,
      'Globe': Globe,
      'Leaf': Leaf,
      'Palette': Palette,
      'DollarSign': DollarSign,
      'Zap': Zap,
      'Users': Users
    };
    return iconMap[iconName] || Users;
  };

  const filteredPods = pods.filter(pod => {
    const matchesSearch = pod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pod.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           pod.slug.includes(selectedCategory) ||
                           pod.name.toLowerCase().includes(selectedCategory) ||
                           pod.tags?.some(tag => tag.toLowerCase().includes(selectedCategory));
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return (b.messageCount || 0) - (a.messageCount || 0);
      case 'members':
        return (b.memberCount || b.members.length) - (a.memberCount || a.members.length);
      case 'recent':
      default:
        const aTime = a.lastActivity?.seconds || a.updatedAt?.seconds || 0;
        const bTime = b.lastActivity?.seconds || b.updatedAt?.seconds || 0;
        return bTime - aTime;
    }
  });

  const handleJoinPod = async (podId: string) => {
    if (!currentUser) return;
    try {
      await joinPod(podId, currentUser.uid);
    } catch (error) {
      console.error('Error joining pod:', error);
    }
  };

  const handleEnterPod = (podId: string) => {
    navigate(`/pod/${podId}`);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => navigate('/discover')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </motion.button>
              
              <div className="flex items-center gap-3">
                <img src="/logofinal.png" alt="EarnBuddy" className="w-8 h-8" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Community Pods</h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <motion.button
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors relative"
                whileHover={{ scale: 1.05 }}
              >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full"></span>
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

      <div className="container mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search pods..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Sort Options */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Active</option>
                <option value="members">Most Members</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 text-sm transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 text-sm transition-colors ${
                    viewMode === 'list'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
            <motion.button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-5 h-5" />
              Create Pod
            </motion.button>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <motion.button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                    selectedCategory === category.id
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Pods Grid */}
        {loading ? (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 ${
                viewMode === 'list' ? 'flex items-center gap-6' : ''
              }`}>
                <Skeleton className="w-16 h-16 rounded-xl mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex justify-between items-center mb-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            <AnimatePresence>
              {filteredPods.map((pod, index) => {
                const isJoined = currentUser ? pod.members.includes(currentUser.uid) : false;
                const PodIcon = getIconForPod(pod.icon);
                const lastActivity = pod.lastActivity?.seconds 
                  ? new Date(pod.lastActivity.seconds * 1000)
                  : new Date();
                const isActive = Date.now() - lastActivity.getTime() < 24 * 60 * 60 * 1000; // Active in last 24h
                
                return (
                  <motion.div
                    key={pod.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={viewMode === 'list' ? 'w-full' : ''}
                  >
                    {viewMode === 'grid' ? (
                      <PodCard
                        pod={{
                          id: pod.id!,
                          name: pod.name,
                          description: pod.description,
                          members: pod.memberCount || pod.members.length,
                          growth: '+23%',
                          gradient: pod.theme,
                          icon: PodIcon,
                          isJoined,
                          trending: isActive && index < 2
                        }}
                        onJoin={handleJoinPod}
                        onEnter={handleEnterPod}
                      />
                    ) : (
                      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center gap-6">
                          <div className={`w-16 h-16 bg-gradient-to-br ${pod.theme} rounded-2xl flex items-center justify-center relative`}>
                            <PodIcon className="w-8 h-8 text-white" />
                            {isActive && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {pod.name}
                              </h3>
                              {pod.tags && pod.tags.length > 0 && (
                                <div className="flex gap-1">
                                  {pod.tags.slice(0, 2).map(tag => (
                                    <span key={tag} className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-full">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                              {pod.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{pod.memberCount || pod.members.length} members</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircle className="w-4 h-4" />
                                <span>{pod.messageCount || 0} messages</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{isActive ? 'Active today' : 'Quiet'}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <motion.button
                              onClick={() => isJoined ? handleEnterPod(pod.id!) : handleJoinPod(pod.id!)}
                              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                                isJoined
                                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:shadow-lg'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {isJoined ? 'Enter' : 'Join'}
                            </motion.button>
                            {isJoined && (
                              <motion.button
                                className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                                whileHover={{ scale: 1.05 }}
                              >
                                <BellOff className="w-3 h-3" />
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {!loading && filteredPods.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No pods found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Be the first to create a pod in this category!'}
            </p>
            <motion.button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Create First Pod
            </motion.button>
          </div>
        )}
      </div>

      {/* Create Pod Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <CreatePodForm onClose={() => setShowCreateModal(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CreatePodForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { currentUser } = useAuth();
  const { createPod } = usePods();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    isPrivate: false,
    tags: [] as string[]
  });
  const [currentTag, setCurrentTag] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: 'ai', name: 'AI & ML', theme: 'from-blue-500 to-purple-600', icon: 'Cpu' },
    { id: 'web3', name: 'Web3', theme: 'from-purple-500 to-pink-600', icon: 'Globe' },
    { id: 'climate', name: 'Climate Tech', theme: 'from-green-500 to-emerald-600', icon: 'Leaf' },
    { id: 'design', name: 'Design', theme: 'from-pink-500 to-red-600', icon: 'Palette' },
    { id: 'fintech', name: 'FinTech', theme: 'from-yellow-500 to-orange-600', icon: 'DollarSign' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !formData.name.trim()) return;

    setLoading(true);
    try {
      const selectedCategory = categories.find(c => c.id === formData.category);
      const podData = {
        name: formData.name,
        slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
        description: formData.description,
        theme: selectedCategory?.theme || 'from-gray-500 to-gray-600',
        icon: selectedCategory?.icon || 'Users',
        tags: formData.tags,
        members: [currentUser.uid],
        createdBy: currentUser.uid,
        isPrivate: formData.isPrivate,
        messageCount: 0,
        onlineMembers: [],
        pinnedMessages: [],
        moderators: [currentUser.uid]
      };

      await createPod(podData);
      onClose();
    } catch (error) {
      console.error('Error creating pod:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, currentTag.trim()] }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };
  return (
    <form onSubmit={handleSubmit}>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create New Pod</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Pod Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="Enter pod name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            rows={3}
            placeholder="Describe your pod"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            required
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              placeholder="Add a tag"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map(tag => (
              <span
                key={tag}
                className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs flex items-center gap-1"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-emerald-600 hover:text-emerald-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isPrivate"
            checked={formData.isPrivate}
            onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
            className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
          />
          <label htmlFor="isPrivate" className="text-sm text-gray-700 dark:text-gray-300">
            Private pod (invite only)
          </label>
        </div>

      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !formData.name.trim()}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create Pod'}
        </button>
      </div>
    </form>
  );
};

export default CommunityPage;
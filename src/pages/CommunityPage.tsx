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
  BellOff,
  Heart,
  Bookmark,
  Share2,
  MoreHorizontal,
  Send,
  Image as ImageIcon,
  Smile,
  Video,
  Edit3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePods, useRooms } from '../hooks/useFirestore';
import { PodCard } from '../components/ui/pod-card';
import { RoomCard } from '../components/ui/room-card';
import { Skeleton } from '../components/ui/skeleton';

const CommunityPage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { pods, loading: podsLoading, joinPod, leavePod } = usePods();
  const { rooms, loading: roomsLoading, joinRoom } = useRooms();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'pods' | 'rooms'>('pods');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending'>('trending');

  // Mock trending topics for pods (Twitter-like)
  const trendingTopics = [
    { tag: '#AI', posts: 1247, trend: '+12%' },
    { tag: '#React', posts: 892, trend: '+8%' },
    { tag: '#Web3', posts: 634, trend: '+23%' },
    { tag: '#Startup', posts: 445, trend: '+15%' },
    { tag: '#Design', posts: 387, trend: '+5%' },
    { tag: '#Climate', posts: 298, trend: '+18%' },
    { tag: '#FinTech', posts: 234, trend: '+9%' },
    { tag: '#Mobile', posts: 189, trend: '+7%' }
  ];

  // Mock posts for pods (Twitter-like feed)
  const mockPodPosts = [
    {
      id: '1',
      user: {
        name: 'Sarah Chen',
        username: '@sarahdev',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face',
        verified: true
      },
      content: 'Just shipped our new AI model! 🚀 Achieved 94% accuracy on the benchmark. The breakthrough came from combining transformer architectures with novel attention mechanisms. Open sourcing next week! #AI #MachineLearning',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500&h=300&fit=crop',
      timestamp: '2h',
      likes: 127,
      comments: 23,
      shares: 15,
      pod: 'AI Builders',
      tags: ['#AI', '#MachineLearning']
    },
    {
      id: '2',
      user: {
        name: 'Marcus Rodriguez',
        username: '@marcuspm',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
        verified: false
      },
      content: 'Looking for collaborators on a new NLP project focused on sentiment analysis for financial markets. We\'re exploring real-time processing of news feeds and social media to predict market movements. DM me if interested! #NLP #FinTech #Collaboration',
      timestamp: '4h',
      likes: 89,
      comments: 12,
      shares: 8,
      pod: 'FinTech Innovators',
      tags: ['#NLP', '#FinTech', '#Collaboration']
    },
    {
      id: '3',
      user: {
        name: 'Alex Kim',
        username: '@alexdesign',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        verified: true
      },
      content: 'New design system components are live! 🎨 Spent weeks perfecting the accessibility and dark mode support. The component library now includes 50+ components with full TypeScript support. Check it out! #Design #DesignSystems #Accessibility',
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=300&fit=crop',
      timestamp: '6h',
      likes: 156,
      comments: 34,
      shares: 22,
      pod: 'Design Systems',
      tags: ['#Design', '#DesignSystems', '#Accessibility']
    },
    {
      id: '4',
      user: {
        name: 'Emma Thompson',
        username: '@emmacto',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face',
        verified: false
      },
      content: 'Climate tech startup idea: AI-powered carbon footprint tracking for small businesses. Real-time monitoring, actionable insights, and automated reporting. Who\'s interested in building this together? 🌱 #Climatetech #Startup #AI',
      timestamp: '8h',
      likes: 203,
      comments: 45,
      shares: 31,
      pod: 'Climate Tech',
      tags: ['#Climatetech', '#Startup', '#AI']
    },
    {
      id: '5',
      user: {
        name: 'David Park',
        username: '@davidweb3',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=40&h=40&fit=crop&crop=face',
        verified: true
      },
      content: 'Just deployed our first DeFi protocol on mainnet! 🎉 After months of testing and audits, we\'re finally live. The protocol enables cross-chain yield farming with minimal gas fees. Early adopters welcome! #Web3 #DeFi #Blockchain',
      timestamp: '12h',
      likes: 312,
      comments: 67,
      shares: 89,
      pod: 'Web3 Pioneers',
      tags: ['#Web3', '#DeFi', '#Blockchain']
    }
  ];

  const categories = [
    { id: 'all', name: 'All', icon: Globe },
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
  });

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPosts = mockPodPosts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           post.tags.some(tag => tag.toLowerCase().includes(selectedCategory.replace('#', '')));
    return matchesSearch && matchesCategory;
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

  const handleJoinRoom = async (roomId: string) => {
    if (!currentUser) return;
    try {
      await joinRoom(roomId);
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  const handleEnterRoom = (roomId: string) => {
    navigate(`/room/${roomId}`);
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Community</h1>
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
        {/* Tab Navigation */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            <motion.button
              onClick={() => setActiveTab('pods')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'pods'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              whileHover={{ scale: 1.02 }}
            >
              Pods
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('rooms')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'rooms'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              whileHover={{ scale: 1.02 }}
            >
              Rooms
            </motion.button>
          </div>

          <motion.button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-5 h-5" />
            Create {activeTab === 'pods' ? 'Pod' : 'Room'}
          </motion.button>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>

            {activeTab === 'pods' && (
              <div className="flex items-center gap-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                >
                  <option value="trending">Trending</option>
                  <option value="recent">Most Recent</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            )}
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

        {/* Content based on active tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'pods' ? (
            <motion.div
              key="pods"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-8"
            >
              {/* Left Sidebar - Trending Topics */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 sticky top-24">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    Trending Topics
                  </h3>
                  <div className="space-y-3">
                    {trendingTopics.map((topic, index) => (
                      <motion.button
                        key={topic.tag}
                        onClick={() => setSearchTerm(topic.tag)}
                        className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{ x: 5 }}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">{topic.tag}</span>
                          <span className="text-xs text-green-600 dark:text-green-400">{topic.trend}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{topic.posts.toLocaleString()} posts</p>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Feed - Posts */}
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  {/* Create Post */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex gap-3">
                      <img
                        src={currentUser?.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"}
                        alt="Your avatar"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <textarea
                          placeholder="What's happening in the builder community?"
                          className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg"
                          rows={3}
                        />
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                              <ImageIcon className="w-5 h-5 text-gray-500" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                              <Smile className="w-5 h-5 text-gray-500" />
                            </button>
                          </div>
                          <motion.button
                            className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Post
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Posts Feed */}
                  {filteredPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="flex gap-3">
                        <img
                          src={post.user.avatar}
                          alt={post.user.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-gray-900 dark:text-white">{post.user.name}</span>
                            {post.user.verified && (
                              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                            <span className="text-gray-500 dark:text-gray-400">{post.user.username}</span>
                            <span className="text-gray-500 dark:text-gray-400">•</span>
                            <span className="text-gray-500 dark:text-gray-400">{post.timestamp}</span>
                            <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-full">
                              {post.pod}
                            </span>
                          </div>
                          
                          <div className="text-gray-800 dark:text-gray-200 mb-3 leading-relaxed">
                            {post.content}
                          </div>

                          {post.image && (
                            <img
                              src={post.image}
                              alt="Post image"
                              className="w-full h-64 object-cover rounded-xl mb-3 cursor-pointer hover:opacity-95 transition-opacity"
                            />
                          )}

                          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-6">
                              <motion.button
                                className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Heart className="w-5 h-5" />
                                <span>{post.likes}</span>
                              </motion.button>
                              
                              <motion.button
                                className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <MessageCircle className="w-5 h-5" />
                                <span>{post.comments}</span>
                              </motion.button>
                              
                              <motion.button
                                className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Share2 className="w-5 h-5" />
                                <span>{post.shares}</span>
                              </motion.button>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <motion.button
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                whileHover={{ scale: 1.1 }}
                              >
                                <Bookmark className="w-4 h-4 text-gray-500" />
                              </motion.button>
                              <motion.button
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                whileHover={{ scale: 1.1 }}
                              >
                                <MoreHorizontal className="w-4 h-4 text-gray-500" />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right Sidebar - Pod Suggestions */}
              <div className="lg:col-span-1">
                <div className="space-y-6">
                  {/* Suggested Pods */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 sticky top-24">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Suggested Pods</h3>
                    <div className="space-y-4">
                      {filteredPods.slice(0, 3).map((pod, index) => {
                        const isJoined = currentUser ? pod.members.includes(currentUser.uid) : false;
                        const PodIcon = getIconForPod(pod.icon);
                        
                        return (
                          <motion.div
                            key={pod.id}
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <div className={`w-10 h-10 bg-gradient-to-r ${pod.theme} rounded-lg flex items-center justify-center`}>
                              <PodIcon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white">{pod.name}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{pod.memberCount || pod.members.length} members</p>
                            </div>
                            <motion.button
                              onClick={() => isJoined ? handleEnterPod(pod.id!) : handleJoinPod(pod.id!)}
                              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                isJoined
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                              }`}
                              whileHover={{ scale: 1.05 }}
                            >
                              {isJoined ? 'View' : 'Join'}
                            </motion.button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Community Stats */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Community Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Total Posts</span>
                        <span className="font-bold text-gray-900 dark:text-white">12.4K</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Active Builders</span>
                        <span className="font-bold text-gray-900 dark:text-white">2.8K</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Pods Created</span>
                        <span className="font-bold text-gray-900 dark:text-white">156</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">This Week</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">+23%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="rooms"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Rooms Grid */}
              {roomsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                      <Skeleton className="w-16 h-16 rounded-xl mb-4" />
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-4" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRooms.map((room, index) => {
                    const isJoined = currentUser ? room.members.includes(currentUser.uid) : false;
                    
                    return (
                      <motion.div
                        key={room.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <RoomCard
                          room={{
                            id: room.id!,
                            name: room.name,
                            description: room.description,
                            members: room.members.length,
                            isPrivate: room.isPrivate,
                            lastActivity: 'Active now',
                            gradient: 'from-emerald-500 to-emerald-600',
                            isJoined,
                            unreadMessages: Math.floor(Math.random() * 5)
                          }}
                          onJoin={handleJoinRoom}
                          onEnter={handleEnterRoom}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {!roomsLoading && filteredRooms.length === 0 && (
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No rooms found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {searchTerm ? 'Try adjusting your search terms' : 'Create your first room to start collaborating!'}
                  </p>
                  <motion.button
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Create First Room
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CommunityPage;
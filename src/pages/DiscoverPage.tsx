import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Briefcase, 
  Rocket, 
  MessageCircle, 
  User, 
  Search, 
  Plus, 
  TrendingUp, 
  Star, 
  Calendar,
  ArrowRight,
  Hash,
  Zap,
  Globe,
  Target,
  Award,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  Filter,
  BarChart3,
  Video,
  Eye
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePods, useGigs, useStartups, useAnalytics, useRecommendations, useOnboarding } from '../hooks/useFirestore';
import { TrendingPods } from '../components/ui/trending-pods';
import { BuilderFeed } from '../components/ui/builder-feed';
import { FloatingCard } from '../components/ui/floating-card';
import { Skeleton } from '../components/ui/skeleton';
import { AdvancedSearch } from '../components/ui/advanced-search';
import { AnalyticsDashboard } from '../components/ui/analytics-dashboard';
import { NotificationCenter } from '../components/ui/notification-center';
import { VideoCall } from '../components/ui/video-call';
import { OnboardingFlow } from '../components/ui/onboarding-flow';
import ThemeToggle from '../components/ThemeToggle';

const DiscoverPage: React.FC = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const { pods, loading: podsLoading } = usePods();
  const { gigs, loading: gigsLoading } = useGigs();
  const { startups, loading: startupsLoading } = useStartups();
  const { analytics, loading: analyticsLoading } = useAnalytics();
  const { recommendations, loading: recommendationsLoading } = useRecommendations();
  const { saveOnboardingResponse } = useOnboarding();
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(!userProfile?.onboardingCompleted);

  // Mock notifications
  const notifications = [
    {
      id: '1',
      type: 'message' as const,
      title: 'New message from Sarah Chen',
      message: 'Hey! I saw your profile and would love to collaborate on a project.',
      timestamp: '2 minutes ago',
      read: false,
      priority: 'medium' as const
    },
    {
      id: '2',
      type: 'project' as const,
      title: 'Project milestone completed',
      message: 'React Dashboard project has been marked as complete.',
      timestamp: '1 hour ago',
      read: false,
      priority: 'high' as const
    },
    {
      id: '3',
      type: 'payment' as const,
      title: 'Payment received',
      message: 'You received $2,500 for the E-commerce Platform project.',
      timestamp: '3 hours ago',
      read: true,
      priority: 'medium' as const
    }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleSearch = (filters: any) => {
    console.log('Search filters:', filters);
    // Implement search logic
  };

  const handleNotificationAction = (id: string) => {
    console.log('Notification action:', id);
  };

  const handleOnboardingComplete = (data: any) => {
    console.log('Onboarding data:', data);
    
    // Save onboarding data to database
    saveOnboardingResponse(data).then(() => {
      setShowOnboarding(false);
      // Refresh the page to show personalized content
      window.location.reload();
    }).catch(error => {
      console.error('Error saving onboarding data:', error);
    });
  };

  // Personalized quick actions based on user's onboarding
  const getPersonalizedQuickActions = () => {
    const baseActions = [
      { 
        title: 'Community Pods', 
        description: 'Join builder communities', 
        icon: Hash, 
        path: '/community', 
        color: 'from-blue-500 to-purple-600',
        count: pods.length
      },
      { 
        title: 'Freelance Gigs', 
        description: 'Find freelance opportunities', 
        icon: Briefcase, 
        path: '/freelance', 
        color: 'from-green-500 to-emerald-600',
        count: gigs.length
      },
      { 
        title: 'Startups', 
        description: 'Discover startup opportunities', 
        icon: Rocket, 
        path: '/startups', 
        color: 'from-purple-500 to-pink-600',
        count: startups.length
      },
      { 
        title: 'Chat Rooms', 
        description: 'Connect in real-time', 
        icon: MessageCircle, 
        path: '/rooms', 
        color: 'from-orange-500 to-red-600',
        count: 12
      }
    ];

    // Reorder based on user's role from onboarding
    if (userProfile?.onboardingData?.role === 'freelancer') {
      return [baseActions[1], baseActions[0], baseActions[2], baseActions[3]]; // Freelance first
    } else if (userProfile?.onboardingData?.role === 'founder') {
      return [baseActions[2], baseActions[1], baseActions[0], baseActions[3]]; // Startups first
    } else if (userProfile?.onboardingData?.role === 'builder') {
      return [baseActions[0], baseActions[3], baseActions[1], baseActions[2]]; // Community first
    }
    
    return baseActions;
  };

  const quickActions = getPersonalizedQuickActions();

  // Personalized stats based on user data
  const getPersonalizedStats = () => {
    if (!analytics) {
      return [
        { label: 'Active Builders', value: '2,847', icon: Users, change: '+12%' },
        { label: 'Projects Launched', value: '156', icon: Rocket, change: '+8%' },
        { label: 'Successful Matches', value: '94%', icon: Target, change: '+2%' },
        { label: 'Total Earnings', value: '$2.4M', icon: Award, change: '+15%' }
      ];
    }

    return [
      { label: 'Profile Views', value: analytics.profileViews.toString(), icon: Eye, change: '+12%' },
      { label: 'Posts Created', value: analytics.postsCreated.toString(), icon: MessageCircle, change: '+8%' },
      { label: 'Pods Joined', value: analytics.podsJoined.toString(), icon: Users, change: '+2%' },
      { label: 'Projects Completed', value: analytics.completedProjects.toString(), icon: Award, change: '+15%' }
    ];
  };

  const stats = getPersonalizedStats();

  // Personalized activity based on recommendations
  const getPersonalizedActivity = () => {
    if (!recommendations) {
      return [
        { type: 'New Gig', title: 'Frontend Developer needed for SaaS platform', time: '2 min ago', urgent: true },
        { type: 'Startup', title: 'HealthTech startup looking for co-founder', time: '5 min ago', urgent: false },
        { type: 'Pod Update', title: 'AI Builders pod reached 500 members', time: '10 min ago', urgent: false },
        { type: 'New Member', title: 'Sarah Chen joined Climate Tech pod', time: '15 min ago', urgent: false }
      ];
    }

    const activity = [];
    
    // Add recommended gigs
    if (recommendations.recommendedGigs?.length > 0) {
      activity.push({
        type: 'Recommended Gig',
        title: recommendations.recommendedGigs[0].title,
        time: '2 min ago',
        urgent: true
      });
    }

    // Add recommended startups
    if (recommendations.recommendedStartups?.length > 0) {
      activity.push({
        type: 'Recommended Startup',
        title: `${recommendations.recommendedStartups[0].name} is looking for ${userProfile?.onboardingData?.role || 'builders'}`,
        time: '5 min ago',
        urgent: false
      });
    }

    // Add recommended pods
    if (recommendations.recommendedPods?.length > 0) {
      activity.push({
        type: 'Recommended Pod',
        title: `${recommendations.recommendedPods[0].name} matches your interests`,
        time: '10 min ago',
        urgent: false
      });
    }

    return activity.length > 0 ? activity : [
      { type: 'Welcome', title: 'Complete your profile to get personalized recommendations', time: 'Now', urgent: true }
    ];
  };

  const recentActivity = getPersonalizedActivity();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <img src="/logofinal.png" alt="EarnBuddy" className="w-10 h-10" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">EarnBuddy</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Discover Dashboard</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="hidden md:flex relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search opportunities..."
                  className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 w-64"
                />
                <motion.button
                  onClick={() => setShowAdvancedSearch(true)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  whileHover={{ scale: 1.1 }}
                >
                  <Filter className="w-4 h-4 text-gray-500" />
                </motion.button>
              </div>

              {/* Analytics Button */}
              <motion.button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                <BarChart3 className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </motion.button>

              {/* Video Call Button */}
              <motion.button
                onClick={() => setShowVideoCall(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                <Video className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </motion.button>

              {/* Notifications */}
              <motion.button
                onClick={() => setShowNotifications(true)}
                className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                <Bell className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </motion.button>

              {/* Profile Dropdown */}
              <div className="relative">
                <motion.button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  whileHover={{ scale: 1.02 }}
                >
                  <img
                    src={userProfile?.photoURL || currentUser?.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {userProfile?.displayName || currentUser?.displayName || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Builder</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </motion.button>

                <AnimatePresence>
                  {showProfileDropdown && (
                    <motion.div
                      className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <motion.button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          navigate('/profile');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </motion.button>
                      <motion.button
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </motion.button>
                      <div className="border-t border-gray-200 dark:border-gray-700">
                        <motion.button
                          onClick={() => {
                            setShowProfileDropdown(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                          whileHover={{ x: 5 }}
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Click outside to close dropdown */}
      {showProfileDropdown && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowProfileDropdown(false)}
        />
      )}

      <div className="container mx-auto px-6 py-8">
        {/* Analytics Dashboard */}
        <AnimatePresence>
          {showAnalytics && (
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AnalyticsDashboard />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Welcome Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {userProfile?.displayName?.split(' ')[0] || 'Builder'}! 
            {userProfile?.onboardingData?.role && (
              <span className="text-emerald-600 dark:text-emerald-400"> 
                ({userProfile.onboardingData.role.charAt(0).toUpperCase() + userProfile.onboardingData.role.slice(1)})
              </span>
            )} 👋
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {userProfile?.onboardingData?.role === 'freelancer' 
              ? "Here are the latest freelance opportunities matching your skills."
              : userProfile?.onboardingData?.role === 'founder'
              ? "Discover talented builders and grow your startup team."
              : "Here's what's happening in your builder network today."
            }
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <FloatingCard className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {stat.change}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </FloatingCard>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.section
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Quick Actions</h3>
            <motion.button
              className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 text-sm font-medium flex items-center gap-1"
              whileHover={{ scale: 1.05 }}
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                className="group cursor-pointer"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                onClick={() => navigate(action.path)}
              >
                <div className={`bg-gradient-to-r ${action.color} rounded-2xl p-6 text-white shadow-lg group-hover:shadow-xl transition-all duration-300 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <action.icon className="w-8 h-8" />
                    <span className="text-2xl font-bold">{action.count}</span>
                  </div>
                  <div className="relative z-10">
                    <h3 className="font-bold text-lg mb-1">{action.title}</h3>
                    <p className="text-sm opacity-90">{action.description}</p>
                  </div>
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-white/20 rounded-full animate-ping"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Activity */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <FloatingCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Live</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                      whileHover={{ x: 5 }}
                    >
                      <div className={`w-2 h-2 rounded-full mt-2 ${activity.urgent ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{activity.type}</span>
                          {activity.urgent && (
                            <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-full">Urgent</span>
                          )}
                        </div>
                        <p className="text-gray-900 dark:text-white font-medium">{activity.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  className="w-full mt-4 py-3 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors font-medium"
                  whileHover={{ scale: 1.02 }}
                >
                  View All Activity
                </motion.button>
              </FloatingCard>
            </motion.section>

            {/* Builder Feed */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <BuilderFeed />
            </motion.section>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Trending Pods */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {podsLoading ? (
                <FloatingCard className="p-6">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-lg" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                    ))}
                  </div>
                </FloatingCard>
              ) : (
                <TrendingPods pods={pods} />
              )}
            </motion.section>

            {/* Personalized Recommendations */}
            {recommendations && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <FloatingCard className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Recommended for You
                  </h3>
                  
                  <div className="space-y-4">
                    {recommendations.recommendedGigs?.slice(0, 2).map((gig: any, index: number) => (
                      <motion.div
                        key={gig.id}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-emerald-300 dark:hover:border-emerald-500 transition-colors cursor-pointer"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        onClick={() => navigate('/freelance')}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-1">{gig.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{gig.description}</p>
                            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                              <span>{gig.budget}</span>
                              <span>•</span>
                              <span>{gig.duration}</span>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </motion.div>
                    ))}
                    
                    {recommendations.recommendedPods?.slice(0, 1).map((pod: any, index: number) => (
                      <motion.div
                        key={pod.id}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-emerald-300 dark:hover:border-emerald-500 transition-colors cursor-pointer"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        onClick={() => navigate('/community')}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-1">{pod.name} Pod</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{pod.description}</p>
                            <div className="text-xs text-blue-600 dark:text-blue-400">
                              {pod.memberCount || pod.members?.length || 0} members
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </FloatingCard>
              </motion.section>
            )}

            {/* Quick Stats */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <FloatingCard className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Your Progress</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Profile Completion</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {userProfile?.onboardingCompleted ? '100%' : '85%'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <motion.div 
                        className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: userProfile?.onboardingCompleted ? "100%" : "85%" }}
                        transition={{ duration: 1, delay: 0.8 }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Network Growth</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {Math.min(((analytics?.podsJoined || 0) * 20), 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <motion.div 
                        className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(((analytics?.podsJoined || 0) * 20), 100)}%` }}
                        transition={{ duration: 1, delay: 1 }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Activity Score</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {Math.min(((analytics?.postsCreated || 0) * 10 + (analytics?.messagesPosted || 0) * 2), 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <motion.div 
                        className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(((analytics?.postsCreated || 0) * 10 + (analytics?.messagesPosted || 0) * 2), 100)}%` }}
                        transition={{ duration: 1, delay: 1.2 }}
                      />
                    </div>
                  </div>
                </div>

                <motion.button
                  className="w-full mt-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/profile')}
                >
                  {userProfile?.onboardingCompleted ? 'View Profile' : 'Complete Profile'}
                </motion.button>
              </FloatingCard>
            </motion.section>

          </div>
        </div>
      </div>

      {/* Advanced Search Modal */}
      <AdvancedSearch
        isOpen={showAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
        onSearch={handleSearch}
      />

      {/* Notification Center */}
      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onMarkAsRead={handleNotificationAction}
        onMarkAllAsRead={() => console.log('Mark all as read')}
        onDelete={handleNotificationAction}
      />

      {/* Video Call */}
      <VideoCall
        isOpen={showVideoCall}
        onClose={() => setShowVideoCall(false)}
        roomName="Team Standup"
        participants={[]}
      />

      {/* Onboarding Flow */}
      <OnboardingFlow
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
        onSkip={() => setShowOnboarding(false)}
      />
    </div>
  );
};

export default DiscoverPage;
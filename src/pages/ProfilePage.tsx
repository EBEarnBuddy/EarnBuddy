import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  MapPin, 
  Calendar, 
  Star, 
  Briefcase, 
  Users, 
  TrendingUp,
  Award,
  BookOpen,
  Code,
  Palette,
  MessageCircle,
  Settings,
  Camera,
  BarChart3,
  Eye,
  DollarSign,
  Target,
  Activity
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAnalytics } from '../hooks/useFirestore';
import DashboardNavbar from '../components/DashboardNavbar';

const ProfilePage: React.FC = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const { analytics, loading: analyticsLoading } = useAnalytics();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');
  const [editedProfile, setEditedProfile] = useState({
    displayName: userProfile?.displayName || '',
    bio: userProfile?.bio || '',
    location: userProfile?.location || '',
    skills: userProfile?.skills || []
  });

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleSaveProfile = () => {
    // TODO: Implement profile update
    setIsEditing(false);
  };

  const stats = [
    { label: 'Projects Completed', value: userProfile?.completedProjects || 0, icon: Briefcase },
    { label: 'Pods Joined', value: userProfile?.joinedPods?.length || 0, icon: Users },
    { label: 'Rating', value: userProfile?.rating || 0, icon: Star },
    { label: 'Total Earnings', value: userProfile?.totalEarnings || '$0', icon: TrendingUp }
  ];

  const analyticsStats = [
    { label: 'Profile Views', value: analytics?.profileViews || 0, icon: Eye, change: '+12%' },
    { label: 'Posts Created', value: analytics?.postsCreated || 0, icon: MessageCircle, change: '+8%' },
    { label: 'Messages Sent', value: analytics?.messagesPosted || 0, icon: Activity, change: '+15%' },
    { label: 'Network Growth', value: analytics?.podsJoined || 0, icon: Users, change: '+5%' }
  ];

  const recentActivity = [
    { type: 'joined', item: 'AI Builders Pod', time: '2 days ago', icon: Users },
    { type: 'applied', item: 'Frontend Developer Gig', time: '1 week ago', icon: Briefcase },
    { type: 'completed', item: 'React Dashboard Project', time: '2 weeks ago', icon: Award },
    { type: 'posted', item: 'Looking for co-founder', time: '3 weeks ago', icon: MessageCircle }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">

      <DashboardNavbar />

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="relative">
              <img
                src={userProfile?.photoURL || currentUser?.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face"}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-emerald-500/20"
              />
              <motion.button
                className="absolute bottom-0 right-0 p-2 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Camera className="w-4 h-4" />
              </motion.button>
            </div>

            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editedProfile.displayName}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, displayName: e.target.value }))}
                    className="text-2xl font-bold bg-transparent border-b-2 border-emerald-500 text-gray-900 dark:text-white focus:outline-none"
                    placeholder="Your Name"
                  />
                  <textarea
                    value={editedProfile.bio}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                    rows={3}
                    placeholder="Tell us about yourself..."
                  />
                  <input
                    type="text"
                    value={editedProfile.location}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="Location"
                  />
                  <div className="flex gap-3">
                    <motion.button
                      onClick={handleSaveProfile}
                      className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                    >
                      Save
                    </motion.button>
                    <motion.button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                    >
                      Cancel
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {userProfile?.displayName || currentUser?.displayName || 'Anonymous User'}
                    </h2>
                    <motion.button
                      onClick={() => setIsEditing(true)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Edit className="w-5 h-5 text-gray-500" />
                    </motion.button>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    {userProfile?.bio || 'No bio added yet. Click edit to add one!'}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{userProfile?.location || 'Location not set'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {userProfile?.joinDate ? new Date(userProfile.joinDate.seconds * 1000).toLocaleDateString() : 'Recently'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-8">
          <motion.button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'overview'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            whileHover={{ scale: 1.02 }}
          >
            Overview
          </motion.button>
          <motion.button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === 'analytics'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            whileHover={{ scale: 1.02 }}
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </motion.button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {(activeTab === 'overview' ? stats : analyticsStats).map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
                {activeTab === 'analytics' && 'change' in stat && (
                  <div className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center justify-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {stat.change}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {activeTab === 'overview' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Skills */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Code className="w-6 h-6 text-emerald-600" />
                  Skills
                </h3>
                <motion.button
                  className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                >
                  Edit
                </motion.button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {userProfile?.skills && userProfile.skills.length > 0 ? (
                  userProfile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No skills added yet</p>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
                Recent Activity
              </h3>
              
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <motion.div
                      key={index}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-white font-medium">
                          {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} {activity.item}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Analytics Tab */
          <div className="space-y-8">
            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Activity Chart */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-emerald-600" />
                  Activity Overview
                </h3>
                
                <div className="space-y-4">
                  {[
                    { label: 'Profile Views', value: analytics?.profileViews || 0, max: 200, color: 'bg-blue-500' },
                    { label: 'Posts Created', value: analytics?.postsCreated || 0, max: 20, color: 'bg-green-500' },
                    { label: 'Messages Sent', value: analytics?.messagesPosted || 0, max: 100, color: 'bg-purple-500' },
                    { label: 'Projects Applied', value: (analytics?.gigsApplied || 0) + (analytics?.startupsApplied || 0), max: 10, color: 'bg-orange-500' }
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{item.value}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <motion.div
                          className={`h-2 rounded-full ${item.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((item.value / item.max) * 100, 100)}%` }}
                          transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Target className="w-6 h-6 text-emerald-600" />
                  Performance
                </h3>
                
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                      {userProfile?.rating || 0}/5
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">Overall Rating</p>
                    <div className="flex justify-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star} 
                          className={`w-4 h-4 ${
                            star <= (userProfile?.rating || 0) 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`} 
                        />
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {userProfile?.completedProjects || 0}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Projects</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {userProfile?.totalEarnings || '$0'}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Earned</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Analytics */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Detailed Analytics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Eye className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics?.profileViews || 0}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Profile Views</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">+12% this week</p>
                </div>
                
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics?.podsJoined || 0}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Communities</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">+2 this month</p>
                </div>
                
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <MessageCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics?.messagesPosted || 0}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Messages</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">+15% this week</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
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
  Camera
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

const ProfilePage: React.FC = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
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

  const recentActivity = [
    { type: 'joined', item: 'AI Builders Pod', time: '2 days ago', icon: Users },
    { type: 'applied', item: 'Frontend Developer Gig', time: '1 week ago', icon: Briefcase },
    { type: 'completed', item: 'React Dashboard Project', time: '2 weeks ago', icon: Award },
    { type: 'posted', item: 'Looking for co-founder', time: '3 weeks ago', icon: MessageCircle }
  ];

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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
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

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
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
              </motion.div>
            );
          })}
        </div>

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
      </div>
    </div>
  );
};

export default ProfilePage;
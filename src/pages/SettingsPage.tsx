import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sun, 
  Moon, 
  Monitor, 
  Bell, 
  Shield, 
  User, 
  Globe, 
  Smartphone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DashboardNavbar from '../components/DashboardNavbar';

const SettingsPage: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'system';
    }
    return 'system';
  });
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    mentions: true,
    projects: true,
    marketing: false
  });
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEmail: false,
    showActivity: true
  });

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System theme
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemPrefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const themeOptions = [
    { id: 'light', name: 'Light', icon: Sun, description: 'Light mode' },
    { id: 'dark', name: 'Dark', icon: Moon, description: 'Dark mode' },
    { id: 'system', name: 'System', icon: Monitor, description: 'Follow system preference' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <DashboardNavbar />

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <motion.button
            onClick={() => navigate('/discover')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </motion.button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your account preferences and settings</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Theme Settings */}
          <motion.div
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-lg flex items-center justify-center">
                <Sun className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Appearance</h2>
                <p className="text-gray-600 dark:text-gray-400">Choose your preferred theme</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <motion.button
                    key={option.id}
                    onClick={() => handleThemeChange(option.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      theme === option.id
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className={`w-8 h-8 mx-auto mb-3 ${
                      theme === option.id ? 'text-emerald-600' : 'text-gray-600 dark:text-gray-400'
                    }`} />
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{option.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{option.description}</p>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Notification Settings */}
          <motion.div
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h2>
                <p className="text-gray-600 dark:text-gray-400">Control what notifications you receive</p>
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white capitalize">
                      {key === 'email' ? 'Email Notifications' :
                       key === 'push' ? 'Push Notifications' :
                       key === 'mentions' ? 'Mentions & Replies' :
                       key === 'projects' ? 'Project Updates' :
                       'Marketing Emails'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {key === 'email' ? 'Receive notifications via email' :
                       key === 'push' ? 'Browser push notifications' :
                       key === 'mentions' ? 'When someone mentions you' :
                       key === 'projects' ? 'Updates on your projects' :
                       'Product updates and tips'}
                    </p>
                  </div>
                  <motion.button
                    onClick={() => setNotifications(prev => ({ ...prev, [key]: !value }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      value ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                      animate={{ x: value ? 26 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </motion.button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Privacy Settings */}
          <motion.div
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-purple-500 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Privacy</h2>
                <p className="text-gray-600 dark:text-gray-400">Control your privacy and data sharing</p>
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(privacy).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {key === 'profileVisible' ? 'Public Profile' :
                       key === 'showEmail' ? 'Show Email' :
                       'Show Activity'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {key === 'profileVisible' ? 'Make your profile visible to other users' :
                       key === 'showEmail' ? 'Display your email on your profile' :
                       'Show your recent activity to others'}
                    </p>
                  </div>
                  <motion.button
                    onClick={() => setPrivacy(prev => ({ ...prev, [key]: !value }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      value ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                      animate={{ x: value ? 26 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </motion.button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Account Settings */}
          <motion.div
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-500 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Account</h2>
                <p className="text-gray-600 dark:text-gray-400">Manage your account settings</p>
              </div>
            </div>

            <div className="space-y-4">
              <motion.button
                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900 dark:text-white">Change Email</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{currentUser?.email}</p>
                  </div>
                </div>
                <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
              </motion.button>

              <motion.button
                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900 dark:text-white">Change Password</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Update your password</p>
                  </div>
                </div>
                <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
              </motion.button>

              <motion.button
                className="w-full flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-red-600 dark:text-red-400"
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5" />
                  <div className="text-left">
                    <h3 className="font-medium">Delete Account</h3>
                    <p className="text-sm opacity-80">Permanently delete your account</p>
                  </div>
                </div>
                <ArrowLeft className="w-5 h-5 opacity-60 rotate-180" />
              </motion.button>
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div
            className="flex justify-end"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <motion.button
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Save className="w-5 h-5" />
              Save Changes
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
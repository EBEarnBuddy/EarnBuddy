import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Bell,
  BarChart3,
  Video,
  ChevronDown,
  User,
  Settings,
  LogOut,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const DashboardNavbar: React.FC = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const navItems = [
    { name: 'Discover', path: '/discover' },
    { name: 'Freelance', path: '/freelance' },
    { name: 'Startups', path: '/startups' },
    { name: 'Community', path: '/community' }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const isActivePage = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <motion.div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate('/discover')}
              whileHover={{ scale: 1.05 }}
            >
              <img src="/logofinal.png" alt="EarnBuddy" className="w-10 h-10" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">EarnBuddy</span>
            </motion.div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <motion.button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    isActivePage(item.path)
                      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.name}
                </motion.button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Messages Button */}
            <motion.button
              onClick={() => navigate('/community')}
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              <MessageCircle className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </motion.button>

            {/* Profile Dropdown */}
            <div className="relative">
              <motion.button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                whileHover={{ scale: 1.02 }}
              >
                <img
                  src={userProfile?.photoURL || currentUser?.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover border-2 border-emerald-500/20"
                />
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </motion.button>

              <AnimatePresence>
                {showProfileDropdown && (
                  <motion.div
                    className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-50"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* User Info */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <img
                          src={userProfile?.photoURL || currentUser?.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"}
                          alt="Profile"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {userProfile?.displayName || currentUser?.displayName || 'User'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {currentUser?.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <motion.button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          navigate('/notifications');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        <Bell className="w-4 h-4" />
                        <span>Notifications</span>
                      </motion.button>

                      <motion.button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          navigate('/profile');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        <User className="w-4 h-4" />
                        Profile & Analytics
                      </motion.button>

                      <motion.button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          navigate('/settings');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </motion.button>
                    </div>

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
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden mt-4 flex items-center gap-1 overflow-x-auto">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                isActivePage(item.path)
                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {item.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Click outside to close dropdown */}
      {showProfileDropdown && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowProfileDropdown(false)}
        />
      )}
    </header>
  );
};

export default DashboardNavbar;
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  Check,
  Trash2,
  Filter,
  MessageCircle,
  Users,
  Briefcase,
  Star,
  DollarSign,
  Calendar,
  AlertCircle,
  Settings,
  MoreHorizontal
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DashboardNavbar from '../components/DashboardNavbar';

interface Notification {
  id: string;
  type: 'message' | 'project' | 'payment' | 'system' | 'social';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  avatar?: string;
  sender?: string;
}

const NotificationsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  // TODO: Replace with real notifications from API
  const notifications: Notification[] = [];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message': return MessageCircle;
      case 'project': return Briefcase;
      case 'payment': return DollarSign;
      case 'social': return Users;
      case 'system': return Settings;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'high') return 'text-red-600 bg-red-100 dark:bg-red-900/30';

    switch (type) {
      case 'message': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'project': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'payment': return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30';
      case 'social': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread': return !notification.read;
      case 'important': return notification.priority === 'high';
      default: return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    // Implementation would update the notification status
    console.log('Mark as read:', id);
  };

  const handleMarkAllAsRead = () => {
    // Implementation would mark all notifications as read
    console.log('Mark all as read');
  };

  const handleDelete = (id: string) => {
    // Implementation would delete the notification
    console.log('Delete notification:', id);
  };

  const toggleSelectNotification = (id: string) => {
    setSelectedNotifications(prev =>
      prev.includes(id)
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <DashboardNavbar />

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => navigate('/discover')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </motion.button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Bell className="w-8 h-8 text-emerald-600" />
                Notifications
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Stay updated with your latest activities</p>
            </div>
          </div>

          {unreadCount > 0 && (
            <motion.button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors font-medium"
              whileHover={{ scale: 1.05 }}
            >
              Mark all as read
            </motion.button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          {[
            { key: 'all', label: 'All', count: notifications.length },
            { key: 'unread', label: 'Unread', count: unreadCount },
            { key: 'important', label: 'Important', count: notifications.filter(n => n.priority === 'high').length }
          ].map(filterOption => (
            <motion.button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                filter === filterOption.key
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {filterOption.label}
              <span className={`px-2 py-1 rounded-full text-xs ${
                filter === filterOption.key
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {filterOption.count}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No notifications
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You're all caught up! Check back later for updates.
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification, index) => {
              const Icon = getNotificationIcon(notification.type);
              const colorClass = getNotificationColor(notification.type, notification.priority);

              return (
                <motion.div
                  key={notification.id}
                  className={`bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border transition-all duration-300 hover:shadow-xl ${
                    notification.read
                      ? 'border-gray-200 dark:border-gray-700'
                      : 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-900/10'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-start gap-4">
                    {notification.avatar ? (
                      <img
                        src={notification.avatar}
                        alt={notification.sender}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClass}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-semibold ${
                              notification.read
                                ? 'text-gray-700 dark:text-gray-300'
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {notification.title}
                            </h3>
                            {notification.priority === 'high' && (
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            )}
                            {!notification.read && (
                              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            )}
                          </div>

                          <p className={`mb-3 leading-relaxed ${
                            notification.read
                              ? 'text-gray-600 dark:text-gray-400'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {notification.message}
                          </p>

                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {notification.timestamp}
                            </span>
                            {notification.sender && (
                              <span className="text-sm text-emerald-600 dark:text-emerald-400">
                                from {notification.sender}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <motion.button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                              whileHover={{ scale: 1.1 }}
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4 text-gray-500" />
                            </motion.button>
                          )}
                          <motion.button
                            onClick={() => handleDelete(notification.id)}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            whileHover={{ scale: 1.1 }}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-500" />
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
              );
            })
          )}
        </div>

        {/* Load More */}
        {filteredNotifications.length > 0 && (
          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <motion.button
              className="px-6 py-3 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors font-medium"
              whileHover={{ scale: 1.05 }}
            >
              Load More Notifications
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
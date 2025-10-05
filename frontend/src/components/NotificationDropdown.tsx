import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Check,
  Trash2,
  MessageCircle,
  Users,
  Briefcase,
  Star,
  DollarSign,
  Calendar,
  AlertCircle,
  Settings,
  MoreHorizontal,
  Filter,
  X
} from 'lucide-react';
import { useNotifications } from '../hooks/useFirestore';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

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

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose, onUnreadCountChange }) => {
  const { notifications, loading, markAsRead, unreadCount } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all');
  // Default mock notifications
  const defaultMockNotifications: Notification[] = [
    {
      id: '1',
      type: 'message',
      title: 'New message from John Doe',
      message: 'Hey! I saw your profile and wanted to connect about a potential project...',
      timestamp: '2 min ago',
      read: false,
      priority: 'medium',
      sender: 'John Doe',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: '2',
      type: 'project',
      title: 'Project application accepted',
      message: 'Congratulations! Your application for "E-commerce Platform" has been accepted.',
      timestamp: '1 hour ago',
      read: true,
      priority: 'high',
      sender: 'Project Team'
    },
    {
      id: '3',
      type: 'payment',
      title: 'Payment received',
      message: 'You received a payment of $500 for your recent project work.',
      timestamp: '3 hours ago',
      read: false,
      priority: 'high'
    }
  ];

  // Load notifications from localStorage or use defaults
  const [mockNotifications, setMockNotifications] = useState<Notification[]>(() => {
    try {
      const saved = localStorage.getItem('mockNotifications');
      return saved ? JSON.parse(saved) : defaultMockNotifications;
    } catch (error) {
      console.error('Error loading notifications from localStorage:', error);
      return defaultMockNotifications;
    }
  });

  // Use mock data if no real notifications are loaded after timeout
  const displayNotifications = notifications.length > 0 ? notifications : mockNotifications;

  // Calculate total unread count (for both real and mock notifications)
  const totalUnreadCount = notifications.length > 0
    ? unreadCount
    : mockNotifications.filter(n => !n.read).length;

  // Helper function to save notifications to localStorage
  const saveNotificationsToStorage = (notifications: Notification[]) => {
    try {
      localStorage.setItem('mockNotifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notifications to localStorage:', error);
    }
  };

  // Notify parent component of unread count changes
  useEffect(() => {
    if (onUnreadCountChange) {
      onUnreadCountChange(totalUnreadCount);
    }
  }, [totalUnreadCount, onUnreadCountChange]);

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

  const filteredNotifications = displayNotifications.filter(notification => {
    switch (filter) {
      case 'unread': return !notification.read;
      case 'important': return notification.priority === 'high';
      default: return true;
    }
  });

    const handleMarkAsRead = async (id: string) => {
    try {
      // For mock notifications, update the local state and save to localStorage
      if (notifications.length === 0) {
        const updatedNotifications = mockNotifications.map(notification =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        );
        setMockNotifications(updatedNotifications);
        saveNotificationsToStorage(updatedNotifications);
        return;
      }
      await markAsRead(id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

    const handleMarkAllAsRead = async () => {
    try {
      // For mock notifications, update all notifications to read and save to localStorage
      if (notifications.length === 0) {
        const updatedNotifications = mockNotifications.map(notification => ({ ...notification, read: true }));
        setMockNotifications(updatedNotifications);
        saveNotificationsToStorage(updatedNotifications);
        return;
      }
      // Implementation would mark all notifications as read
      console.log('Mark all as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // For mock notifications, remove from local state and save to localStorage
      if (notifications.length === 0) {
        const updatedNotifications = mockNotifications.filter(notification => notification.id !== id);
        setMockNotifications(updatedNotifications);
        saveNotificationsToStorage(updatedNotifications);
        return;
      }
      // Implementation would delete the notification
      console.log('Delete notification:', id);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleResetToDefault = () => {
    setMockNotifications(defaultMockNotifications);
    saveNotificationsToStorage(defaultMockNotifications);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isOpen && !target.closest('.notification-dropdown')) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="notification-dropdown absolute top-full right-0 mt-2 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden z-50 max-h-96 overflow-y-auto"
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-emerald-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                                 {totalUnreadCount > 0 && (
                   <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                     {totalUnreadCount}
                   </span>
                 )}
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 mt-3">
              {[
                { key: 'all', label: 'All' },
                { key: 'unread', label: 'Unread' },
                { key: 'important', label: 'Important' }
              ].map(filterOption => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-300 ${
                    filter === filterOption.key
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>

                         <div className="flex items-center justify-between mt-2">
               {totalUnreadCount > 0 && (
                 <button
                   onClick={handleMarkAllAsRead}
                   className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium"
                 >
                   Mark all as read
                 </button>
               )}
               {notifications.length === 0 && (
                 <button
                   onClick={handleResetToDefault}
                   className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium"
                   title="Reset to default notifications"
                 >
                   Reset to default
                 </button>
               )}
             </div>
          </div>

                     {/* Notifications List */}
           <div className="p-2">
             {loading ? (
               <div className="p-4 text-center">
                 <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 mx-auto"></div>
                 <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading notifications...</p>
               </div>
             ) : filteredNotifications.length === 0 ? (
               <div className="p-6 text-center">
                 <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                 <p className="text-sm text-gray-500 dark:text-gray-400">
                   {filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}
                 </p>
                 <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                   {filter === 'all' ? 'You\'re all caught up!' : 'Check back later for updates'}
                 </p>
               </div>
             ) : (
              <div className="space-y-2">
                {filteredNotifications.slice(0, 10).map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  const colorClass = getNotificationColor(notification.type, notification.priority);

                  return (
                    <motion.div
                      key={notification.id}
                      className={`p-3 rounded-lg transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        notification.read
                          ? 'bg-white dark:bg-gray-800'
                          : 'bg-emerald-50/30 dark:bg-emerald-900/10 border-l-2 border-emerald-500'
                      }`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                    >
                      <div className="flex items-start gap-3">
                        {notification.avatar ? (
                          <img
                            src={notification.avatar}
                            alt={notification.sender}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className={`text-sm font-medium truncate ${
                                  notification.read
                                    ? 'text-gray-700 dark:text-gray-300'
                                    : 'text-gray-900 dark:text-white'
                                }`}>
                                  {notification.title}
                                </h4>
                                {notification.priority === 'high' && (
                                  <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                                )}
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></div>
                                )}
                              </div>

                              <p className={`text-xs leading-relaxed mb-2 line-clamp-2 ${
                                notification.read
                                  ? 'text-gray-600 dark:text-gray-400'
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}>
                                {notification.message}
                              </p>

                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {notification.timestamp}
                                </span>
                                {notification.sender && (
                                  <span className="text-xs text-emerald-600 dark:text-emerald-400 truncate">
                                    from {notification.sender}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              {!notification.read && (
                                <button
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                                  title="Mark as read"
                                >
                                  <Check className="w-3 h-3 text-gray-500" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(notification.id)}
                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3 text-gray-500 hover:text-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 10 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <button className="w-full text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium">
                View all notifications
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationDropdown;
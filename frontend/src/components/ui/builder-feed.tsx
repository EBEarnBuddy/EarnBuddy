import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Zap } from 'lucide-react';
import { FloatingCard } from './floating-card';
import { useAuth } from '../../contexts/AuthContext';

interface BuilderActivity {
  id: string;
  user: {
    name: string;
    avatar: string;
    title: string;
  };
  action: string;
  project: string;
  timestamp: string;
  type: 'build' | 'join' | 'launch' | 'fund';
}

export const BuilderFeed: React.FC = () => {
  const { userProfile } = useAuth();

  // Generate activities based on user profile if available
  const generateActivities = (): BuilderActivity[] => {
    // If we have user activity, show real activities
    if (userProfile?.activityLog && userProfile.activityLog.length > 0) {
      return userProfile.activityLog.slice(0, 3).map((activity, index) => ({
        id: activity.id || `activity-${index}`,
        user: {
          name: userProfile.displayName || 'Anonymous',
          avatar: userProfile.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
          title: userProfile.title || 'Builder'
        },
        action: activity.action || 'updated',
        project: activity.description || 'their profile',
        timestamp: activity.timestamp || 'recently',
        type: 'build' as const
      }));
    }

    // Return empty array if no real activity
    return [];
  };

  const activities = generateActivities();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'launch': return TrendingUp;
      case 'join': return Users;
      case 'fund': return TrendingUp;
      default: return Zap;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'launch': return 'text-emerald-600 bg-emerald-100';
      case 'join': return 'text-blue-600 bg-blue-100';
      case 'fund': return 'text-purple-600 bg-purple-100';
      case 'apply': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <FloatingCard className="p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Live Builder Activity</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Live</span>
        </div>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = getTypeIcon(activity.type);
          return (
            <motion.div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50/80 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <img
                src={activity.user.avatar}
                alt={activity.user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">{activity.user.name}</span>
                  <div className={`p-1 rounded-full ${getTypeColor(activity.type)}`}>
                    <Icon className="w-3 h-3" />
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  {activity.action} <span className="font-medium">{activity.project}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </FloatingCard>
  );
};
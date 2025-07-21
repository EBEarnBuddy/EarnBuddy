import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Award,
  Clock,
  Eye,
  MessageCircle
} from 'lucide-react';
import { FloatingCard } from './floating-card';

interface AnalyticsData {
  revenue: {
    current: number;
    previous: number;
    growth: number;
  };
  users: {
    active: number;
    new: number;
    retention: number;
  };
  projects: {
    completed: number;
    active: number;
    success_rate: number;
  };
  engagement: {
    messages: number;
    sessions: number;
    avg_session: string;
  };
}

export const AnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  
  // Mock data - in real app, this would come from API
  const data: AnalyticsData = {
    revenue: { current: 125000, previous: 98000, growth: 27.5 },
    users: { active: 2847, new: 342, retention: 89.2 },
    projects: { completed: 156, active: 89, success_rate: 94.2 },
    engagement: { messages: 15420, sessions: 8934, avg_session: '24m' }
  };

  const timeRanges = [
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? '↗' : '↘';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your platform's performance and growth metrics
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {timeRanges.map(range => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range.value
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <FloatingCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(data.revenue.current)}
                </p>
                <p className={`text-sm flex items-center gap-1 ${getGrowthColor(data.revenue.growth)}`}>
                  <span>{getGrowthIcon(data.revenue.growth)}</span>
                  {Math.abs(data.revenue.growth)}% vs last period
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </FloatingCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <FloatingCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(data.users.active)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatNumber(data.users.new)} new this period
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </FloatingCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <FloatingCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Projects Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(data.projects.completed)}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {data.projects.success_rate}% success rate
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </FloatingCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <FloatingCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Engagement</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(data.engagement.messages)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {data.engagement.avg_session} avg session
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </FloatingCard>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <FloatingCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                Revenue Trend
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Last {timeRange}
              </div>
            </div>
            
            {/* Mock Chart - Replace with actual chart library */}
            <div className="h-64 bg-gradient-to-t from-emerald-50 to-transparent dark:from-emerald-900/20 rounded-lg flex items-end justify-between p-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t"
                  style={{ 
                    height: `${Math.random() * 80 + 20}%`,
                    width: '12%'
                  }}
                />
              ))}
            </div>
          </FloatingCard>
        </motion.div>

        {/* User Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <FloatingCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <PieChart className="w-5 h-5 text-blue-600" />
                User Activity
              </h3>
            </div>
            
            <div className="space-y-4">
              {[
                { label: 'Active Projects', value: 45, color: 'bg-blue-500' },
                { label: 'Completed Tasks', value: 78, color: 'bg-green-500' },
                { label: 'Messages Sent', value: 92, color: 'bg-purple-500' },
                { label: 'Profile Views', value: 34, color: 'bg-orange-500' }
              ].map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{item.value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full ${item.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      transition={{ duration: 1, delay: 0.6 + index * 0.1 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </FloatingCard>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <FloatingCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            Recent Activity
          </h3>
          
          <div className="space-y-4">
            {[
              { icon: Award, text: 'New project completed by Sarah Chen', time: '2 minutes ago', type: 'success' },
              { icon: Users, text: '5 new users joined the AI Builders pod', time: '15 minutes ago', type: 'info' },
              { icon: MessageCircle, text: 'High activity in Climate Tech discussions', time: '1 hour ago', type: 'info' },
              { icon: DollarSign, text: 'Payment processed for React Dashboard project', time: '2 hours ago', type: 'success' },
              { icon: Eye, text: 'Your startup listing got 23 new views', time: '3 hours ago', type: 'info' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  activity.type === 'success' 
                    ? 'bg-green-100 dark:bg-green-900/30' 
                    : 'bg-blue-100 dark:bg-blue-900/30'
                }`}>
                  <activity.icon className={`w-5 h-5 ${
                    activity.type === 'success'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-blue-600 dark:text-blue-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-white font-medium">{activity.text}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </FloatingCard>
      </motion.div>
    </div>
  );
};
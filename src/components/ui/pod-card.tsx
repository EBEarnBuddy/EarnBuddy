import React from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Zap, MessageCircle, Clock, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PodCardProps {
  pod: {
    id: string;
    name: string;
    description: string;
    members: number;
    growth: string;
    gradient: string;
    icon: React.ComponentType<any>;
    isJoined: boolean;
    trending?: boolean;
    messageCount?: number;
    onlineMembers?: number;
    lastActivity?: string;
  };
  onJoin: (podId: string) => void;
  onEnter: (podId: string) => void;
}

export const PodCard: React.FC<PodCardProps> = ({ pod, onJoin, onEnter }) => {
  return (
    <motion.div
      className="group relative"
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Glow Effect */}
      <div className={`absolute -inset-1 bg-gradient-to-r ${pod.gradient} rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
      
      <div className="relative bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6 shadow-lg group-hover:shadow-2xl transition-all duration-500 overflow-hidden">
        {/* Trending Badge */}
        {pod.trending && (
          <motion.div
            className="absolute top-4 right-4 px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-medium rounded-full flex items-center gap-1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
          >
            <TrendingUp className="w-3 h-3" />
            Hot
          </motion.div>
        )}

        {/* Pod Icon */}
        <motion.div
          className={`w-16 h-16 bg-gradient-to-br ${pod.gradient} rounded-2xl flex items-center justify-center mb-4 relative overflow-hidden`}
          whileHover={{ rotate: 5, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <pod.icon className="w-8 h-8 text-white relative z-10" />
            {pod.isJoined ? 'Open Chat' : 'Join Pod'}
        </motion.div>

        {/* Content */}
        <div className="space-y-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-700 group-hover:bg-clip-text transition-all duration-300">
              {pod.name}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">{pod.description}</p>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-gray-500">
              <Users className="w-4 h-4" />
              <span>{pod.members.toLocaleString()} builders</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-600 font-medium">
              <Zap className="w-3 h-3" />
              <span>{pod.growth}</span>
            </div>
          </div>

          {/* Action Button */}
          <motion.button
            onClick={() => pod.isJoined ? onEnter(pod.id) : onJoin(pod.id)}
            className={cn(
              "w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden",
              pod.isJoined
                ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg hover:shadow-emerald-500/25"
                : "bg-gray-100 text-gray-700 hover:bg-gradient-to-r hover:from-emerald-600 hover:to-emerald-500 hover:text-white"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10">
              {pod.isJoined ? 'Enter Pod' : 'Join Pod'}
            </span>
            {!pod.isJoined && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-500"
                initial={{ x: "-100%" }}
                whileHover={{ x: "0%" }}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1 text-gray-500">
              <MessageCircle className="w-3 h-3" />
              <span>{pod.messageCount || 0}</span>
            </div>
            <div className="flex items-center gap-1 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{pod.onlineMembers || 0}</span>
            </div>
          </motion.button>
        </div>

        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
          <div className={`w-full h-full bg-gradient-to-br ${pod.gradient} rounded-full transform translate-x-8 -translate-y-8`} />
        </div>
      </div>
      
      {/* Activity Indicator */}
      {pod.isJoined && pod.messageCount && pod.messageCount > 0 && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
      )}
    </motion.div>
  );
};
import React from 'react';
import { motion } from 'framer-motion';
import { Users, MessageCircle, Lock, Globe, Video, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoomCardProps {
  room: {
    id: string;
    name: string;
    description: string;
    members: number;
    isPrivate: boolean;
    lastActivity: string;
    gradient: string;
    isJoined: boolean;
    unreadMessages?: number;
  };
  onJoin: (roomId: string) => void;
  onEnter: (roomId: string) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onJoin, onEnter }) => {
  return (
    <motion.div
      className="group relative"
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Glow Effect */}
      <div className={`absolute -inset-1 bg-gradient-to-r ${room.gradient} rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
      
      <div className="relative bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6 shadow-lg group-hover:shadow-2xl transition-all duration-500 overflow-hidden">
        {/* Privacy Indicator */}
        <div className="absolute top-4 right-4">
          {room.isPrivate ? (
            <Lock className="w-4 h-4 text-gray-500" />
          ) : (
            <Globe className="w-4 h-4 text-emerald-500" />
          )}
        </div>

        {/* Room Icon */}
        <motion.div
          className={`w-16 h-16 bg-gradient-to-br ${room.gradient} rounded-2xl flex items-center justify-center mb-4 relative overflow-hidden`}
          whileHover={{ rotate: 5, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <MessageCircle className="w-8 h-8 text-white relative z-10" />
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </motion.div>

        {/* Content */}
        <div className="space-y-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-700 group-hover:bg-clip-text transition-all duration-300">
              {room.name}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">{room.description}</p>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-gray-500">
              <Users className="w-4 h-4" />
              <span>{room.members} members</span>
            </div>
            <div className="text-gray-500">
              <span>{room.lastActivity}</span>
            </div>
          </div>

          {/* Unread Messages */}
          {room.unreadMessages && room.unreadMessages > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-emerald-600 font-medium">
                {room.unreadMessages} new messages
              </span>
            </div>
          )}

          {/* Action Button */}
          <motion.button
            onClick={() => room.isJoined ? onEnter(room.id) : onJoin(room.id)}
            className={cn(
              "w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden",
              room.isJoined
                ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg hover:shadow-emerald-500/25"
                : "bg-gray-100 text-gray-700 hover:bg-gradient-to-r hover:from-emerald-600 hover:to-emerald-500 hover:text-white"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10">
              {room.isJoined ? 'Enter Room' : 'Join Room'}
            </span>
            {!room.isJoined && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-500"
                initial={{ x: "-100%" }}
                whileHover={{ x: "0%" }}
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.button>
        </div>

        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
          <div className={`w-full h-full bg-gradient-to-br ${room.gradient} rounded-full transform translate-x-8 -translate-y-8`} />
        </div>
      </div>
    </motion.div>
  );
};
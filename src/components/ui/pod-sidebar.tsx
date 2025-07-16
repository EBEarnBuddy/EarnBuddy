import React from 'react';
import { motion } from 'framer-motion';
import { Users, Link, Calendar, FileText, Plus, Circle } from 'lucide-react';

interface PodSidebarProps {
  pod: {
    name: string;
    description: string;
    members: number;
    onlineMembers: number;
  };
  activeRooms: Array<{
    id: string;
    name: string;
    members: number;
    isActive: boolean;
  }>;
  pinnedLinks: Array<{
    id: string;
    title: string;
    url: string;
    type: string;
  }>;
  onCreateRoom: () => void;
}

export const PodSidebar: React.FC<PodSidebarProps> = ({
  pod,
  activeRooms,
  pinnedLinks,
  onCreateRoom
}) => {
  return (
    <div className="w-80 bg-white/80 backdrop-blur-xl border-l border-gray-200/50 p-6 space-y-6">
      {/* Pod Info */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">About {pod.name}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{pod.description}</p>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-4 h-4" />
            <span>{pod.members.toLocaleString()} members</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-600">
            <Circle className="w-2 h-2 fill-current" />
            <span>{pod.onlineMembers} online</span>
          </div>
        </div>
      </motion.div>

      {/* Active Rooms */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-900">Active Rooms</h4>
          <motion.button
            onClick={onCreateRoom}
            className="p-1 hover:bg-emerald-100 rounded-lg transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Plus className="w-4 h-4 text-emerald-600" />
          </motion.button>
        </div>

        <div className="space-y-2">
          {activeRooms.map((room, index) => (
            <motion.div
              key={room.id}
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ x: 5 }}
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${room.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                <div>
                  <p className="font-medium text-gray-900 text-sm">{room.name}</p>
                  <p className="text-xs text-gray-500">{room.members} members</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Pinned Resources */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h4 className="font-semibold text-gray-900">Pinned Resources</h4>
        <div className="space-y-2">
          {pinnedLinks.map((link, index) => (
            <motion.a
              key={link.id}
              href={link.url}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ x: 5 }}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-lg flex items-center justify-center">
                {link.type === 'notion' ? <FileText className="w-4 h-4 text-white" /> :
                 link.type === 'calendar' ? <Calendar className="w-4 h-4 text-white" /> :
                 <Link className="w-4 h-4 text-white" />}
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm group-hover:text-emerald-600 transition-colors">
                  {link.title}
                </p>
                <p className="text-xs text-gray-500 capitalize">{link.type}</p>
              </div>
            </motion.a>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <motion.button
          className="w-full p-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Invite Members
        </motion.button>
        <motion.button
          className="w-full p-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Share Pod
        </motion.button>
      </motion.div>
    </div>
  );
};
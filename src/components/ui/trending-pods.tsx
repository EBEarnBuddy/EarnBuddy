import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Zap, ExternalLink } from 'lucide-react';
import { FloatingCard } from './floating-card';
import { Pod } from '../../lib/firestore';
import { useNavigate } from 'react-router-dom';

interface TrendingPodsProps {
  pods: Pod[];
}

export const TrendingPods: React.FC<TrendingPodsProps> = ({ pods }) => {
  const navigate = useNavigate();
  
  const trendingPods = pods.slice(0, 3).map(pod => ({
    id: pod.id,
    name: pod.name,
    description: pod.description,
    members: pod.memberCount || pod.members.length,
    growth: '+23%', // This would ideally be calculated from actual data
    gradient: pod.theme,
    icon: pod.icon === 'Zap' ? Zap : pod.icon === 'Users' ? Users : TrendingUp
  }));

  return (
    <FloatingCard className="p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Trending Pods</h3>
        <motion.button
          onClick={() => navigate('/community')}
          className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 text-sm font-medium flex items-center gap-1"
          whileHover={{ scale: 1.05 }}
        >
          View All
          <ExternalLink className="w-4 h-4" />
        </motion.button>
      </div>

      <div className="grid gap-4 flex-1">
        {trendingPods.length > 0 ? (
          trendingPods.map((pod, index) => {
            const Icon = pod.icon;
            return (
              <motion.div
                key={pod.id}
                className="group cursor-pointer"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate('/community')}
              >
                <div className="relative p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 border border-gray-200/50 dark:border-gray-600/50 hover:border-emerald-300/50 dark:hover:border-emerald-500/50 transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${pod.gradient} text-white`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                          {pod.name}
                        </h4>
                        <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full flex-shrink-0">
                          {pod.growth}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{pod.description}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                        <Users className="w-3 h-3" />
                        <span>{pod.members.toLocaleString()} builders</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400">No trending pods available</p>
          </div>
        )}
      </div>
    </FloatingCard>
  );
};
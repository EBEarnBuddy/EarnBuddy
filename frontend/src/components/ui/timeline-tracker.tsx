import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  Circle, 
  AlertCircle, 
  Users, 
  MessageCircle,
  FileText,
  Target,
  TrendingUp,
  Plus,
  Edit,
  X
} from 'lucide-react';

interface TimelineItem {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending' | 'overdue';
  dueDate: string;
  assignee?: string;
  priority: 'low' | 'medium' | 'high';
  type: 'milestone' | 'task' | 'meeting' | 'deadline';
}

interface TimelineTrackerProps {
  projectName: string;
  items: TimelineItem[];
  onAddItem?: (item: Omit<TimelineItem, 'id'>) => void;
  onUpdateItem?: (id: string, updates: Partial<TimelineItem>) => void;
}

export const TimelineTracker: React.FC<TimelineTrackerProps> = ({
  projectName,
  items,
  onAddItem,
  onUpdateItem
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    status: 'pending' as const,
    dueDate: '',
    priority: 'medium' as const,
    type: 'task' as const
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in-progress': return Clock;
      case 'overdue': return AlertCircle;
      default: return Circle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'in-progress': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'overdue': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'milestone': return Target;
      case 'meeting': return Users;
      case 'deadline': return AlertCircle;
      default: return FileText;
    }
  };

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const completedCount = items.filter(item => item.status === 'completed').length;
  const progressPercentage = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  const handleAddItem = () => {
    if (onAddItem && newItem.title.trim()) {
      onAddItem(newItem);
      setNewItem({
        title: '',
        description: '',
        status: 'pending',
        dueDate: '',
        priority: 'medium',
        type: 'task'
      });
      setShowAddModal(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-emerald-600" />
            {projectName} Timeline
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {completedCount} of {items.length} items completed
          </p>
        </div>
        
        <motion.button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
        >
          <Plus className="w-4 h-4" />
          Add Item
        </motion.button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Overall Progress</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <motion.div
            className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'all', label: 'All', count: items.length },
          { key: 'pending', label: 'Pending', count: items.filter(i => i.status === 'pending').length },
          { key: 'in-progress', label: 'In Progress', count: items.filter(i => i.status === 'in-progress').length },
          { key: 'completed', label: 'Completed', count: items.filter(i => i.status === 'completed').length }
        ].map(filterOption => (
          <motion.button
            key={filterOption.key}
            onClick={() => setFilter(filterOption.key as any)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              filter === filterOption.key
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            whileHover={{ scale: 1.05 }}
          >
            {filterOption.label}
            <span className={`px-2 py-1 rounded-full text-xs ${
              filter === filterOption.key
                ? 'bg-white/20 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              {filterOption.count}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Timeline Items */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {filteredItems.map((item, index) => {
          const StatusIcon = getStatusIcon(item.status);
          const TypeIcon = getTypeIcon(item.type);
          
          return (
            <motion.div
              key={item.id}
              className={`relative p-4 border-l-4 ${getPriorityColor(item.priority)} bg-gray-50 dark:bg-gray-800 rounded-lg hover:shadow-md transition-all duration-300`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ x: 5 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${getStatusColor(item.status)}`}>
                    <StatusIcon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{item.title}</h4>
                      <TypeIcon className="w-4 h-4 text-gray-500" />
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                        item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{item.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Due: {item.dueDate}
                      </span>
                      {item.assignee && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {item.assignee}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <motion.button
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  whileHover={{ scale: 1.1 }}
                >
                  <Edit className="w-4 h-4 text-gray-500" />
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {filter === 'all' ? 'No timeline items yet' : `No ${filter} items`}
          </p>
        </div>
      )}

      {/* Add Item Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add Timeline Item</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newItem.title}
                    onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter item title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Describe the item"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type
                    </label>
                    <select
                      value={newItem.type}
                      onChange={(e) => setNewItem(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="task">Task</option>
                      <option value="milestone">Milestone</option>
                      <option value="meeting">Meeting</option>
                      <option value="deadline">Deadline</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={newItem.priority}
                      onChange={(e) => setNewItem(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newItem.dueDate}
                    onChange={(e) => setNewItem(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <motion.button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleAddItem}
                  disabled={!newItem.title.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Add Item
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
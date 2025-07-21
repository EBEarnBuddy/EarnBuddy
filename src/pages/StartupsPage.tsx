import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Plus, 
  MapPin, 
  Users, 
  TrendingUp, 
  Star, 
  Bookmark,
  ExternalLink,
  Rocket,
  DollarSign,
  Building,
  Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useStartups } from '../hooks/useFirestore';
import { Skeleton } from '../components/ui/skeleton';

const StartupsPage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { startups, loading, applyToStartup, bookmarkStartup, unbookmarkStartup } = useStartups();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedStage, setSelectedStage] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const industries = [
    { id: 'all', name: 'All Industries', icon: Building },
    { id: 'healthcare', name: 'Healthcare', icon: Star },
    { id: 'fintech', name: 'FinTech', icon: DollarSign },
    { id: 'education', name: 'EdTech', icon: Users },
    { id: 'climate', name: 'Climate Tech', icon: Zap },
    { id: 'ai', name: 'AI/ML', icon: Rocket }
  ];

  const stages = [
    { id: 'all', name: 'All Stages' },
    { id: 'pre-seed', name: 'Pre-Seed' },
    { id: 'seed', name: 'Seed' },
    { id: 'series-a', name: 'Series A' },
    { id: 'series-b', name: 'Series B+' }
  ];

  const filteredStartups = startups.filter(startup => {
    const matchesSearch = startup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         startup.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = selectedIndustry === 'all' || 
                           startup.industry.toLowerCase().includes(selectedIndustry);
    const matchesStage = selectedStage === 'all' || 
                        startup.stage.toLowerCase().replace(/\s+/g, '-').includes(selectedStage);
    return matchesSearch && matchesIndustry && matchesStage;
  });

  const handleApplyToStartup = async (startupId: string) => {
    if (!currentUser) return;
    try {
      await applyToStartup(startupId, currentUser.uid, {
        coverLetter: 'I am excited about this opportunity and would love to contribute to your mission.',
        portfolio: 'https://myportfolio.com'
      });
    } catch (error) {
      console.error('Error applying to startup:', error);
    }
  };

  const handleBookmarkStartup = async (startupId: string) => {
    if (!currentUser) return;
    try {
      await bookmarkStartup(startupId, currentUser.uid);
    } catch (error) {
      console.error('Error bookmarking startup:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => navigate('/discover')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </motion.button>
              
              <div className="flex items-center gap-3">
                <img src="/logofinal.png" alt="EarnBuddy" className="w-8 h-8" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Startups</h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <motion.button
                onClick={handleLogout}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                Logout
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search startups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>

            <motion.button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-5 h-5" />
              List Startup
            </motion.button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {industries.map((industry) => {
                const Icon = industry.icon;
                return (
                  <motion.button
                    key={industry.id}
                    onClick={() => setSelectedIndustry(industry.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                      selectedIndustry === industry.id
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-4 h-4" />
                    {industry.name}
                  </motion.button>
                );
              })}
            </div>

            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              {stages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Startups Grid */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-20 w-full mb-4" />
                <div className="flex gap-2 mb-4">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <div className="flex justify-between items-center mb-4">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatePresence>
              {filteredStartups.map((startup, index) => {
                const hasApplied = currentUser ? startup.applicants.some(app => app.userId === currentUser.uid) : false;
                
                return (
                  <motion.div
                    key={startup.id}
                    className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {startup.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full">
                            {startup.industry}
                          </span>
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                            {startup.stage}
                          </span>
                        </div>
                      </div>
                      <motion.button
                        onClick={() => handleBookmarkStartup(startup.id!)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Bookmark className="w-5 h-5 text-gray-400 hover:text-emerald-600" />
                      </motion.button>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {startup.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{startup.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold">{startup.funding}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>{startup.equity}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-500">
                        <Users className="w-4 h-4" />
                        <span>{startup.applicantCount || startup.applicants.length} applicants</span>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        startup.status === 'active' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}>
                        {startup.status}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Looking for:</h4>
                        <div className="flex flex-wrap gap-2">
                          {startup.requirements.slice(0, 3).map((req, reqIndex) => (
                            <span
                              key={reqIndex}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                            >
                              {req}
                            </span>
                          ))}
                          {startup.requirements.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                              +{startup.requirements.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <motion.button
                          onClick={() => handleApplyToStartup(startup.id!)}
                          disabled={hasApplied}
                          className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                            hasApplied
                              ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500 cursor-not-allowed'
                              : 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:shadow-lg'
                          }`}
                          whileHover={{ scale: hasApplied ? 1 : 1.02 }}
                          whileTap={{ scale: hasApplied ? 1 : 0.98 }}
                        >
                          {hasApplied ? 'Applied' : 'Apply to Join'}
                        </motion.button>
                        <motion.button
                          className="px-4 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <ExternalLink className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {!loading && filteredStartups.length === 0 && (
          <div className="text-center py-12">
            <Rocket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No startups found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Be the first to list your startup!'}
            </p>
            <motion.button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              List Your Startup
            </motion.button>
          </div>
        )}
      </div>

      {/* Create Startup Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">List Your Startup</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Startup listing is coming soon! For now, browse and apply to existing opportunities.
              </p>
              <motion.button
                onClick={() => setShowCreateModal(false)}
                className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Got it
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StartupsPage;
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Plus, 
  DollarSign, 
  Clock, 
  MapPin, 
  Star, 
  Bookmark,
  ExternalLink,
  Users,
  Briefcase,
  Code,
  Palette,
  Megaphone,
  BarChart,
  Building,
  Zap,
  Award,
  TrendingUp,
  Eye,
  Heart,
  Share2,
  ChevronDown,
  ChevronUp,
  X,
  Send,
  Globe,
  Calendar,
  Target
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProjects } from '../hooks/useFirestore';
import { Skeleton } from '../components/ui/skeleton';
import DashboardNavbar from '../components/DashboardNavbar';

const FreelancePage: React.FC = () => {
  const { currentUser } = useAuth();
  const { projects, loading, applyToRole, bookmarkProject, unbookmarkProject } = useProjects();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    portfolio: '',
    expectedSalary: '',
    availability: ''
  });

  const industries = [
    { id: 'all', name: 'All Industries', icon: Building },
    { id: 'fintech', name: 'FinTech', icon: DollarSign },
    { id: 'e-commerce', name: 'E-commerce', icon: Briefcase },
    { id: 'climate-tech', name: 'Climate Tech', icon: Zap },
    { id: 'healthcare', name: 'HealthTech', icon: Heart },
    { id: 'ai', name: 'AI/ML', icon: Code }
  ];

  const projectTypes = [
    { id: 'all', name: 'All Types' },
    { id: 'startup', name: 'Startup' },
    { id: 'enterprise', name: 'Enterprise' },
    { id: 'agency', name: 'Agency' },
    { id: 'nonprofit', name: 'Non-Profit' }
  ];

  const experienceLevels = [
    { id: 'all', name: 'All Levels' },
    { id: 'entry', name: 'Entry Level' },
    { id: 'mid', name: 'Mid Level' },
    { id: 'senior', name: 'Senior' },
    { id: 'lead', name: 'Lead/Principal' }
  ];

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = selectedIndustry === 'all' || 
                           project.industry.toLowerCase().includes(selectedIndustry.replace('-', ''));
    const matchesType = selectedType === 'all' || project.projectType === selectedType;
    const matchesExperience = selectedExperience === 'all' || 
                             project.roles.some(role => role.experience === selectedExperience);
    return matchesSearch && matchesIndustry && matchesType && matchesExperience;
  });

  const handleApplyToRole = async (projectId: string, roleId: string) => {
    if (!currentUser) return;
    
    try {
      await applyToRole(projectId, roleId, currentUser.uid, applicationData);
      setShowApplicationModal(false);
      setApplicationData({ coverLetter: '', portfolio: '', expectedSalary: '', availability: '' });
      setSelectedRole(null);
    } catch (error) {
      console.error('Error applying to role:', error);
    }
  };

  const handleBookmarkProject = async (projectId: string) => {
    if (!currentUser) return;
    try {
      await bookmarkProject(projectId, currentUser.uid);
    } catch (error) {
      console.error('Error bookmarking project:', error);
    }
  };

  const openApplicationModal = (projectId: string, roleId: string) => {
    setSelectedRole(`${projectId}-${roleId}`);
    setShowApplicationModal(true);
  };

  const getExperienceBadgeColor = (level: string) => {
    switch (level) {
      case 'entry': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'mid': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'senior': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'lead': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 dark:text-red-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <DashboardNavbar />

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Team Projects & Opportunities
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Join innovative teams building the future. Multiple roles available per project.
              </p>
            </div>

            <motion.button
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-6 h-6" />
              Post Team Project
            </motion.button>
          </div>

          {/* Enhanced Search */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <input
                type="text"
                placeholder="Search projects, companies, roles, and technologies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-5 text-xl border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 shadow-lg"
              />
            </div>
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
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              {projectTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>

            <select
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              {experienceLevels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="space-y-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <Skeleton className="h-8 w-3/4 mb-4" />
                    <Skeleton className="h-6 w-1/2 mb-4" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                  <Skeleton className="w-16 h-16 rounded-xl" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            <AnimatePresence>
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  {/* Project Header */}
                  <div className="p-8 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                            <Building className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                              {project.title}
                            </h2>
                            <div className="flex items-center gap-4">
                              <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                                {project.company}
                              </span>
                              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                                {project.industry}
                              </span>
                              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                                {project.projectType}
                              </span>
                              {project.featured && (
                                <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-sm font-medium flex items-center gap-1">
                                  <Star className="w-3 h-3" />
                                  Featured
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-6">
                          {project.description}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <DollarSign className="w-5 h-5" />
                            <div>
                              <p className="text-sm">Total Budget</p>
                              <p className="font-semibold text-gray-900 dark:text-white">{project.totalBudget}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Clock className="w-5 h-5" />
                            <div>
                              <p className="text-sm">Duration</p>
                              <p className="font-semibold text-gray-900 dark:text-white">{project.duration}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <MapPin className="w-5 h-5" />
                            <div>
                              <p className="text-sm">Location</p>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {project.remote ? 'Remote' : project.location}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Users className="w-5 h-5" />
                            <div>
                              <p className="text-sm">Applicants</p>
                              <p className="font-semibold text-gray-900 dark:text-white">{project.totalApplicants}</p>
                            </div>
                          </div>
                        </div>

                        {project.equity && (
                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                              <TrendingUp className="w-5 h-5" />
                              <span className="font-semibold">Equity: {project.equity}</span>
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2 mb-6">
                          {project.tags.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <motion.button
                          onClick={() => handleBookmarkProject(project.id!)}
                          className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Bookmark className="w-6 h-6 text-gray-400 hover:text-emerald-600" />
                        </motion.button>
                        <motion.button
                          className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Share2 className="w-6 h-6 text-gray-400 hover:text-blue-600" />
                        </motion.button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          project.status === 'open' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}>
                          {project.status === 'open' ? 'Actively Hiring' : project.status}
                        </span>
                        <span className={`text-sm font-medium ${getPriorityColor(project.urgency)}`}>
                          {project.urgency.charAt(0).toUpperCase() + project.urgency.slice(1)} Priority
                        </span>
                      </div>

                      <motion.button
                        onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id!)}
                        className="flex items-center gap-2 px-4 py-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors font-medium"
                        whileHover={{ scale: 1.05 }}
                      >
                        View {project.roles.length} Open Roles
                        {expandedProject === project.id ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </motion.button>
                    </div>
                  </div>

                  {/* Roles Section */}
                  <AnimatePresence>
                    {expandedProject === project.id && (
                      <motion.div
                        className="p-8 bg-gray-50 dark:bg-gray-800"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                          Open Roles ({project.roles.length})
                        </h3>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {project.roles.map((role, roleIndex) => {
                            const hasApplied = currentUser ? role.applicants.some(app => app.userId === currentUser.uid) : false;
                            
                            return (
                              <motion.div
                                key={role.id}
                                className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-500 transition-all duration-300"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: roleIndex * 0.1 }}
                                whileHover={{ y: -2 }}
                              >
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex-1">
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                      {role.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mb-3">
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExperienceBadgeColor(role.experience)}`}>
                                        {role.experience.charAt(0).toUpperCase() + role.experience.slice(1)} Level
                                      </span>
                                      {(() => {
                                        const safePriority = (role.priority && typeof role.priority === 'string' && role.priority.trim()) ? role.priority : 'medium';
                                        return (
                                          <span className={`text-sm font-medium ${getPriorityColor(safePriority)}`}>
                                            {safePriority.charAt(0).toUpperCase() + safePriority.slice(1)} Priority
                                          </span>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                  {role.filled && (
                                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-sm">
                                      Filled
                                    </span>
                                  )}
                                </div>

                                <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                                  {role.description}
                                </p>

                                <div className="space-y-4 mb-6">
                                  <div>
                                    <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Key Skills</h5>
                                    <div className="flex flex-wrap gap-2">
                                      {role.skills.filter(skill => skill).slice(0, 4).map((skill, skillIndex) => (
                                        <span
                                          key={skillIndex}
                                          className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm rounded-full"
                                        >
                                          {skill}
                                        </span>
                                      ))}
                                      {role.skills.filter(skill => skill).length > 4 && (
                                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm rounded-full">
                                          +{role.skills.filter(skill => skill).length - 4} more
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-500 dark:text-gray-400">Compensation</span>
                                      <p className="font-semibold text-gray-900 dark:text-white">{role.budget}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 dark:text-gray-400">Commitment</span>
                                      <p className="font-semibold text-gray-900 dark:text-white">{role.timeCommitment}</p>
                                    </div>
                                    {role.equity && (
                                      <div className="col-span-2">
                                        <span className="text-gray-500 dark:text-gray-400">Equity</span>
                                        <p className="font-semibold text-emerald-600 dark:text-emerald-400">{role.equity}</p>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                                    <span>{role.applicants.length} applicants</span>
                                    <span>Posted by {project.postedByName}</span>
                                  </div>
                                </div>

                                <motion.button
                                  onClick={() => hasApplied ? null : openApplicationModal(project.id!, role.id)}
                                  disabled={hasApplied || role.filled}
                                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                                    hasApplied || role.filled
                                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500 cursor-not-allowed'
                                      : 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:shadow-lg'
                                  }`}
                                  whileHover={{ scale: hasApplied || role.filled ? 1 : 1.02 }}
                                  whileTap={{ scale: hasApplied || role.filled ? 1 : 0.98 }}
                                >
                                  {hasApplied ? 'Applied' : role.filled ? 'Position Filled' : 'Apply for this Role'}
                                </motion.button>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {!loading && filteredProjects.length === 0 && (
          <div className="text-center py-16">
            <Briefcase className="w-20 h-20 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">No projects found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
              {searchTerm ? 'Try adjusting your search terms or filters' : 'Be the first to post a team project!'}
            </p>
            <motion.button
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Post Your First Project
            </motion.button>
          </div>
        )}
      </div>

      {/* Application Modal */}
      <AnimatePresence>
        {showApplicationModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowApplicationModal(false)}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Apply for Role</h3>
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cover Letter *
                  </label>
                  <textarea
                    value={applicationData.coverLetter}
                    onChange={(e) => setApplicationData(prev => ({ ...prev, coverLetter: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    rows={6}
                    placeholder="Tell us why you're perfect for this role..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Portfolio/Website
                  </label>
                  <input
                    type="url"
                    value={applicationData.portfolio}
                    onChange={(e) => setApplicationData(prev => ({ ...prev, portfolio: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="https://yourportfolio.com"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Expected Salary
                    </label>
                    <input
                      type="text"
                      value={applicationData.expectedSalary}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, expectedSalary: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="$120,000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Availability *
                    </label>
                    <select
                      value={applicationData.availability}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, availability: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select availability</option>
                      <option value="immediately">Available Immediately</option>
                      <option value="2-weeks">2 Weeks Notice</option>
                      <option value="1-month">1 Month Notice</option>
                      <option value="flexible">Flexible</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <motion.button
                  onClick={() => setShowApplicationModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={() => {
                    if (selectedRole) {
                      const [projectId, roleId] = selectedRole.split('-');
                      handleApplyToRole(projectId, roleId);
                    }
                  }}
                  disabled={!applicationData.coverLetter.trim() || !applicationData.availability}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Submit Application
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Project Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
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
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Post Team Project</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Project posting is coming soon! For now, browse and apply to existing opportunities.
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

export default FreelancePage;
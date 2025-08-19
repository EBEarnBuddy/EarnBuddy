import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Users,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Edit,
  Trash2,
  Eye,
  BookOpen
} from 'lucide-react';
import { getMyProjects, deleteProject } from '../lib/projectService';

interface PostedProject {
  _id: string;
  title: string;
  description: string;
  company: string;
  industry: string;
  projectType: string;
  totalBudget: {
    min: number;
    max: number;
    currency: string;
  };
  duration: string;
  location: string;
  remote: boolean;
  status: string;
  views: number;
  totalApplicants: number;
  roles: Array<{
    _id: string;
    title: string;
    description: string;
    skills: string[];
    experience: string;
    salary: {
      min: number;
      max: number;
      currency: string;
    };
    applicants: Array<{
      _id: string;
      userId: string;
      status: string;
      appliedAt: string;
    }>;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface PostedProjectsListProps {
  onProjectDeleted?: () => void;
}

const PostedProjectsList: React.FC<PostedProjectsListProps> = ({ onProjectDeleted }) => {
  const [projects, setProjects] = useState<PostedProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingProject, setDeletingProject] = useState<string | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await getMyProjects();
      // Ensure data is an array
      if (Array.isArray(data)) {
        setProjects(data);
      } else {
        console.error('Expected array but got:', typeof data, data);
        setProjects([]);
      }
    } catch (error) {
      console.error('Error fetching posted projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    setDeletingProject(projectId);
    try {
      await deleteProject(projectId);
      // Remove the project from the local state
      setProjects(projects.filter(project => project._id !== projectId));
      // Refresh analytics data
      onProjectDeleted?.();
      alert('Project deleted successfully!');
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
    } finally {
      setDeletingProject(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatBudget = (budget: { min: number; max: number; currency: string }) => {
    return `$${budget.min.toLocaleString()} - $${budget.max.toLocaleString()}`;
  };

  const getTotalApplicants = (project: PostedProject) => {
    return project.roles.reduce((total, role) => total + role.applicants.length, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading projects...</span>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-8">
        <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400">No projects posted yet</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          Start by creating your first project!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {projects.map((project, index) => (
        <motion.div
          key={project._id}
          className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {project.title}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {project.company} • {project.industry}
              </p>
              <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2">
                {project.description}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <Edit className="w-4 h-4 text-gray-500" />
              </button>
              <button
                onClick={() => handleDeleteProject(project._id)}
                disabled={deletingProject === project._id}
                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingProject === project._id ? (
                  <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Trash2 className="w-4 h-4 text-red-500" />
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <DollarSign className="w-4 h-4" />
              <span>{formatBudget(project.totalBudget)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{project.duration}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4" />
              <span>{project.remote ? 'Remote' : project.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(project.createdAt)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Eye className="w-4 h-4 text-blue-500" />
              <span className="text-gray-600 dark:text-gray-400">{project.views} views</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-green-500" />
              <span className="text-gray-600 dark:text-gray-400">{getTotalApplicants(project)} applicants</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="w-4 h-4 text-purple-500" />
              <span className="text-gray-600 dark:text-gray-400">{project.roles.length} roles</span>
            </div>
          </div>

          {/* Roles Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Roles ({project.roles.length})</h4>
            <div className="space-y-3">
              {project.roles.map((role) => (
                <div key={role._id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900 dark:text-white">{role.title}</h5>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {role.applicants.length} applicants
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {role.skills.slice(0, 3).map((skill, skillIndex) => (
                      <span
                        key={skillIndex}
                        className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                    {role.skills.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                        +{role.skills.length - 3} more
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                    <span>Experience: {role.experience}</span>
                    <span>
                      Salary: ${role.salary.min.toLocaleString()} - ${role.salary.max.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default PostedProjectsList;
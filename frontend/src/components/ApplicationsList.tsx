import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Clock, CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react';
import { getUserApplications } from '../lib/activityService';

interface Application {
  projectId: string;
  projectTitle: string;
  company: string;
  roleId: string;
  roleTitle: string;
  status: 'pending' | 'processing' | 'shortlisted' | 'accepted' | 'rejected';
  appliedAt: string;
  coverLetter: string;
  portfolio?: string;
  expectedSalary?: string;
  availability: string;
}

const ApplicationsList: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const data = await getUserApplications();
        setApplications(data);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'shortlisted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'shortlisted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'accepted':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading applications...</span>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-8">
        <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400">No applications yet</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          Start applying to projects to see your applications here!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((application, index) => (
        <motion.div
          key={`${application.projectId}-${application.roleId}`}
          className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {application.projectTitle}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {application.company} • {application.roleTitle}
              </p>
              <div className="flex items-center gap-2">
                {getStatusIcon(application.status)}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              {formatDate(application.appliedAt)}
            </div>
          </div>

          <div className="space-y-3">
            {application.coverLetter && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cover Letter:</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                  {application.coverLetter}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {application.expectedSalary && (
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">Expected Salary:</p>
                  <p className="text-gray-600 dark:text-gray-400">{application.expectedSalary}</p>
                </div>
              )}
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-300">Availability:</p>
                <p className="text-gray-600 dark:text-gray-400">{application.availability}</p>
              </div>
            </div>

            {application.portfolio && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Portfolio:</p>
                <a
                  href={application.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 hover:underline text-sm"
                >
                  View Portfolio
                </a>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ApplicationsList;
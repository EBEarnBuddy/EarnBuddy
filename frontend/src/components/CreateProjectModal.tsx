import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Trash2,
  Building,
  DollarSign,
  Clock,
  MapPin,
  Users,
  Code,
  Palette,
  Megaphone,
  BarChart,
  Zap,
  Heart,
  Briefcase,
  Globe,
  Calendar,
  Target,
  Star,
  Award
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from '../lib/axios';

interface Role {
  title: string;
  description: string;
  experience: 'entry' | 'mid' | 'senior' | 'lead';
  skills: string[];
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  equity?: string;
  benefits: string[];
  priority: 'low' | 'medium' | 'high';
}

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    industry: '',
    projectType: 'startup',
    totalBudget: { min: 0, max: 0, currency: 'USD' },
    duration: '',
    location: '',
    remote: false,
    equity: '',
    tags: [] as string[],
    urgency: 'medium' as 'low' | 'medium' | 'high',
    roles: [] as Role[],
    benefits: [] as string[],
    requirements: {
      teamSize: 1,
      startDate: '',
      endDate: '',
      timezone: 'UTC'
    },
    contact: {
      email: '',
      phone: '',
      website: ''
    },
    additionalInfo: ''
  });

  const [newTag, setNewTag] = useState('');
  const [newBenefit, setNewBenefit] = useState('');
  const [newSkill, setNewSkill] = useState('');

  const industries = [
    { id: 'fintech', name: 'FinTech', icon: DollarSign },
    { id: 'e-commerce', name: 'E-commerce', icon: Briefcase },
    { id: 'climate-tech', name: 'Climate Tech', icon: Zap },
    { id: 'healthcare', name: 'HealthTech', icon: Heart },
    { id: 'ai', name: 'AI/ML', icon: Code },
    { id: 'design', name: 'Design', icon: Palette },
    { id: 'marketing', name: 'Marketing', icon: Megaphone },
    { id: 'analytics', name: 'Analytics', icon: BarChart },
    { id: 'other', name: 'Other', icon: Building }
  ];

  const projectTypes = [
    { id: 'startup', name: 'Startup' },
    { id: 'enterprise', name: 'Enterprise' },
    { id: 'agency', name: 'Agency' },
    { id: 'nonprofit', name: 'Non-Profit' }
  ];

  const experienceLevels = [
    { id: 'entry', name: 'Entry Level' },
    { id: 'mid', name: 'Mid Level' },
    { id: 'senior', name: 'Senior' },
    { id: 'lead', name: 'Lead/Principal' }
  ];

  const commonSkills = [
    'React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'Go', 'Rust',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'MongoDB', 'PostgreSQL', 'Redis',
    'GraphQL', 'REST API', 'Machine Learning', 'AI', 'Data Science', 'DevOps',
    'UI/UX Design', 'Product Management', 'Marketing', 'Sales', 'Customer Success'
  ];

  const commonBenefits = [
    'Health Insurance', 'Dental Insurance', 'Vision Insurance', '401(k) Matching',
    'Stock Options', 'Equity', 'Flexible Hours', 'Remote Work', 'Learning Budget',
    'Conference Budget', 'Home Office Setup', 'Gym Membership', 'Mental Health Support',
    'Unlimited PTO', 'Parental Leave', 'Professional Development'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof typeof prev] as any),
        [field]: value
      }
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addBenefit = () => {
    if (newBenefit.trim() && !formData.benefits.includes(newBenefit.trim())) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit.trim()]
      }));
      setNewBenefit('');
    }
  };

  const removeBenefit = (benefitToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter(benefit => benefit !== benefitToRemove)
    }));
  };

  const addRole = () => {
    const newRole: Role = {
      title: '',
      description: '',
      experience: 'entry',
      skills: [],
      salary: { min: 0, max: 0, currency: 'USD' },
      benefits: [],
      priority: 'medium'
    };
    setFormData(prev => ({
      ...prev,
      roles: [...prev.roles, newRole]
    }));
  };

  const updateRole = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.map((role, i) =>
        i === index ? { ...role, [field]: value } : role
      )
    }));
  };

    const updateRoleNested = (index: number, parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.map((role, i) =>
        i === index ? {
          ...role,
          [parent]: { ...(role[parent as keyof Role] as any), [field]: value }
        } : role
      )
    }));
  };

  const removeRole = (index: number) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.filter((_, i) => i !== index)
    }));
  };

  const addSkillToRole = (roleIndex: number) => {
    if (newSkill.trim() && !formData.roles[roleIndex].skills.includes(newSkill.trim())) {
      updateRole(roleIndex, 'skills', [...formData.roles[roleIndex].skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkillFromRole = (roleIndex: number, skillToRemove: string) => {
    updateRole(roleIndex, 'skills', formData.roles[roleIndex].skills.filter(skill => skill !== skillToRemove));
  };

  const addBenefitToRole = (roleIndex: number, benefit: string) => {
    if (!formData.roles[roleIndex].benefits.includes(benefit)) {
      updateRole(roleIndex, 'benefits', [...formData.roles[roleIndex].benefits, benefit]);
    }
  };

  const removeBenefitFromRole = (roleIndex: number, benefitToRemove: string) => {
    updateRole(roleIndex, 'benefits', formData.roles[roleIndex].benefits.filter(benefit => benefit !== benefitToRemove));
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.title && formData.description && formData.company && formData.industry;
      case 2:
        return formData.totalBudget.min > 0 && formData.totalBudget.max > 0 && formData.duration && formData.location;
      case 3:
        return formData.roles.length > 0 && formData.roles.every(role =>
          role.title && role.description && role.salary.min > 0 && role.salary.max > 0
        );
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post('/api/projects', formData);

      if (response.data.success) {
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          title: '',
          description: '',
          company: '',
          industry: '',
          projectType: 'startup',
          totalBudget: { min: 0, max: 0, currency: 'USD' },
          duration: '',
          location: '',
          remote: false,
          equity: '',
          tags: [],
          urgency: 'medium',
          roles: [],
          benefits: [],
          requirements: {
            teamSize: 1,
            startDate: '',
            endDate: '',
            timezone: 'UTC'
          },
          contact: {
            email: '',
            phone: '',
            website: ''
          },
          additionalInfo: ''
        });
        setCurrentStep(1);
      }
    } catch (error: any) {
      console.error('Error creating project:', error);
      if (error.code === 'ERR_NETWORK') {
        alert('Cannot connect to server. Please make sure the backend server is running on http://localhost:5000');
      } else if (error.response?.status === 404) {
        alert('API endpoint not found. Please check if the backend server is running correctly.');
      } else {
        alert(error.response?.data?.message || 'Failed to create project. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Project Details', description: 'Basic information about your project' },
    { number: 2, title: 'Project Requirements', description: 'Budget, timeline, and location' },
    { number: 3, title: 'Team Roles', description: 'Define the roles you need to fill' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Post Team Project
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Create a new project to find talented team members
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-between mt-6">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                      currentStep >= step.number
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-gray-300 dark:border-gray-600 text-gray-500'
                    }`}>
                      {currentStep > step.number ? (
                        <Award className="w-4 h-4" />
                      ) : (
                        <span className="text-sm font-medium">{step.number}</span>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${
                        currentStep >= step.number
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-500'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500">{step.description}</p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-16 h-0.5 mx-4 ${
                        currentStep > step.number
                          ? 'bg-emerald-500'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    {/* Project Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Project Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="e.g., AI-Powered E-commerce Platform"
                        required
                      />
                    </div>

                    {/* Project Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Project Description *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                        rows={4}
                        placeholder="Describe your project, goals, and what you're building..."
                        required
                      />
                    </div>

                    {/* Company */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Company/Organization *
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Your company name"
                        required
                      />
                    </div>

                    {/* Industry */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Industry *
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {industries.map((industry) => {
                          const Icon = industry.icon;
                          return (
                            <button
                              key={industry.id}
                              type="button"
                              onClick={() => handleInputChange('industry', industry.id)}
                              className={`p-4 border-2 rounded-xl text-left transition-all ${
                                formData.industry === industry.id
                                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'
                              }`}
                            >
                              <Icon className="w-6 h-6 mb-2 text-emerald-600" />
                              <p className="font-medium text-gray-900 dark:text-white">{industry.name}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Project Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Project Type *
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {projectTypes.map((type) => (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => handleInputChange('projectType', type.id)}
                            className={`p-4 border-2 rounded-xl text-center transition-all ${
                              formData.projectType === type.id
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'
                            }`}
                          >
                            <p className="font-medium text-gray-900 dark:text-white">{type.name}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Project Tags
                      </label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {formData.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm flex items-center gap-2"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="hover:text-emerald-900"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                          className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="Add a tag..."
                        />
                        <button
                          type="button"
                          onClick={addTag}
                          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    {/* Budget */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Total Project Budget *
                      </label>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Min Amount</label>
                          <input
                            type="number"
                            value={formData.totalBudget.min}
                            onChange={(e) => handleNestedChange('totalBudget', 'min', parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="0"
                            min="0"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Max Amount</label>
                          <input
                            type="number"
                            value={formData.totalBudget.max}
                            onChange={(e) => handleNestedChange('totalBudget', 'max', parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="0"
                            min="0"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Currency</label>
                          <select
                            value={formData.totalBudget.currency}
                            onChange={(e) => handleNestedChange('totalBudget', 'currency', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          >
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                            <option value="CAD">CAD</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Project Duration *
                      </label>
                      <input
                        type="text"
                        value={formData.duration}
                        onChange={(e) => handleInputChange('duration', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="e.g., 2-3 months, 6 weeks, Ongoing"
                        required
                      />
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Location *
                      </label>
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="e.g., San Francisco, CA or Remote"
                          required
                        />
                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={formData.remote}
                            onChange={(e) => handleInputChange('remote', e.target.checked)}
                            className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Remote work is available
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Equity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Equity (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.equity}
                        onChange={(e) => handleInputChange('equity', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="e.g., 0.5% - 2% equity"
                      />
                    </div>

                    {/* Urgency */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Project Urgency
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'low', name: 'Low', color: 'bg-green-100 text-green-700 border-green-300' },
                          { id: 'medium', name: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
                          { id: 'high', name: 'High', color: 'bg-red-100 text-red-700 border-red-300' }
                        ].map((urgency) => (
                          <button
                            key={urgency.id}
                            type="button"
                            onClick={() => handleInputChange('urgency', urgency.id)}
                            className={`p-4 border-2 rounded-xl text-center transition-all ${
                              formData.urgency === urgency.id
                                ? `border-emerald-500 ${urgency.color}`
                                : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'
                            }`}
                          >
                            <p className="font-medium">{urgency.name}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Benefits */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Project Benefits
                      </label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {formData.benefits.map((benefit, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm flex items-center gap-2"
                          >
                            {benefit}
                            <button
                              type="button"
                              onClick={() => removeBenefit(benefit)}
                              className="hover:text-blue-900"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newBenefit}
                          onChange={(e) => setNewBenefit(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                          className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="Add a benefit..."
                        />
                        <button
                          type="button"
                          onClick={addBenefit}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-2">Quick add:</p>
                        <div className="flex flex-wrap gap-2">
                          {commonBenefits.slice(0, 6).map((benefit) => (
                            <button
                              key={benefit}
                              type="button"
                              onClick={() => addBenefit()}
                              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                              {benefit}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    {/* Roles Section */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Team Roles ({formData.roles.length})
                      </h3>
                      <button
                        type="button"
                        onClick={addRole}
                        className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Role
                      </button>
                    </div>

                    {formData.roles.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p>No roles added yet. Add at least one role to continue.</p>
                      </div>
                    )}

                    {formData.roles.map((role, roleIndex) => (
                      <div
                        key={roleIndex}
                        className="border border-gray-200 dark:border-gray-700 rounded-xl p-6"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                            Role {roleIndex + 1}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeRole(roleIndex)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Role Title */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Role Title *
                            </label>
                            <input
                              type="text"
                              value={role.title}
                              onChange={(e) => updateRole(roleIndex, 'title', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                              placeholder="e.g., Senior Frontend Developer"
                              required
                            />
                          </div>

                          {/* Experience Level */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Experience Level *
                            </label>
                            <select
                              value={role.experience}
                              onChange={(e) => updateRole(roleIndex, 'experience', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                              required
                            >
                              {experienceLevels.map((level) => (
                                <option key={level.id} value={level.id}>
                                  {level.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Role Description */}
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Role Description *
                          </label>
                          <textarea
                            value={role.description}
                            onChange={(e) => updateRole(roleIndex, 'description', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                            rows={3}
                            placeholder="Describe the responsibilities and requirements for this role..."
                            required
                          />
                        </div>

                        {/* Salary Range */}
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Salary Range *
                          </label>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Min Salary</label>
                              <input
                                type="number"
                                value={role.salary.min}
                                onChange={(e) => updateRoleNested(roleIndex, 'salary', 'min', parseInt(e.target.value) || 0)}
                                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                placeholder="0"
                                min="0"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Max Salary</label>
                              <input
                                type="number"
                                value={role.salary.max}
                                onChange={(e) => updateRoleNested(roleIndex, 'salary', 'max', parseInt(e.target.value) || 0)}
                                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                placeholder="0"
                                min="0"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Currency</label>
                              <select
                                value={role.salary.currency}
                                onChange={(e) => updateRoleNested(roleIndex, 'salary', 'currency', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                              >
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="GBP">GBP</option>
                                <option value="CAD">CAD</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Skills */}
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Required Skills
                          </label>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {role.skills.map((skill, skillIndex) => (
                              <span
                                key={skillIndex}
                                className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm flex items-center gap-2"
                              >
                                {skill}
                                <button
                                  type="button"
                                  onClick={() => removeSkillFromRole(roleIndex, skill)}
                                  className="hover:text-emerald-900"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newSkill}
                              onChange={(e) => setNewSkill(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkillToRole(roleIndex))}
                              className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                              placeholder="Add a skill..."
                            />
                            <button
                              type="button"
                              onClick={() => addSkillToRole(roleIndex)}
                              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                            >
                              Add
                            </button>
                          </div>
                          <div className="mt-3">
                            <p className="text-xs text-gray-500 mb-2">Quick add:</p>
                            <div className="flex flex-wrap gap-2">
                              {commonSkills.slice(0, 8).map((skill) => (
                                <button
                                  key={skill}
                                  type="button"
                                  onClick={() => addSkillToRole(roleIndex)}
                                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                >
                                  {skill}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Role Benefits */}
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Role-Specific Benefits
                          </label>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {role.benefits.map((benefit, benefitIndex) => (
                              <span
                                key={benefitIndex}
                                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm flex items-center gap-2"
                              >
                                {benefit}
                                <button
                                  type="button"
                                  onClick={() => removeBenefitFromRole(roleIndex, benefit)}
                                  className="hover:text-blue-900"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {commonBenefits.slice(0, 6).map((benefit) => (
                              <button
                                key={benefit}
                                type="button"
                                onClick={() => addBenefitToRole(roleIndex, benefit)}
                                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                              >
                                {benefit}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Priority */}
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Role Priority
                          </label>
                          <div className="grid grid-cols-3 gap-3">
                            {[
                              { id: 'low', name: 'Low', color: 'bg-green-100 text-green-700' },
                              { id: 'medium', name: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
                              { id: 'high', name: 'High', color: 'bg-red-100 text-red-700' }
                            ].map((priority) => (
                              <button
                                key={priority.id}
                                type="button"
                                onClick={() => updateRole(roleIndex, 'priority', priority.id)}
                                className={`p-3 border-2 rounded-lg text-center transition-all ${
                                  role.priority === priority.id
                                    ? `border-emerald-500 ${priority.color}`
                                    : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'
                                }`}
                              >
                                <p className="font-medium">{priority.name}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between">
                <button
                  onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onClose()}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                >
                  {currentStep === 1 ? 'Cancel' : 'Back'}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!validateStep(currentStep) || isSubmitting}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : currentStep === 3 ? (
                    <>
                      <Star className="w-4 h-4" />
                      Create Project
                    </>
                  ) : (
                    <>
                      Next
                      <Target className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateProjectModal;
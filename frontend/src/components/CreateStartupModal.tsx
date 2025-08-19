import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Trash2,
  Building,
  DollarSign,
  MapPin,
  Users,
  Rocket,
  Zap,
  Heart,
  Globe,
  Star,
  Award,
  Briefcase,
  Code,
  Palette,
  Megaphone,
  BarChart
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useStartups } from '../hooks/useFirestore';

interface CreateStartupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateStartupModal: React.FC<CreateStartupModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const { createStartup } = useStartups();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: '',
    stage: 'pre-seed',
    location: '',
    funding: '',
    equity: '',
    requirements: [] as string[],
    contact: {
      email: '',
      website: '',
      linkedin: ''
    },
    additionalInfo: ''
  });

  const [newRequirement, setNewRequirement] = useState('');

  const industries = [
    { id: 'healthcare', name: 'Healthcare', icon: Heart },
    { id: 'fintech', name: 'FinTech', icon: DollarSign },
    { id: 'education', name: 'EdTech', icon: Users },
    { id: 'climate', name: 'Climate Tech', icon: Zap },
    { id: 'ai', name: 'AI/ML', icon: Code },
    { id: 'design', name: 'Design', icon: Palette },
    { id: 'marketing', name: 'Marketing', icon: Megaphone },
    { id: 'analytics', name: 'Analytics', icon: BarChart },
    { id: 'other', name: 'Other', icon: Building }
  ];

  const stages = [
    { id: 'pre-seed', name: 'Pre-Seed' },
    { id: 'seed', name: 'Seed' },
    { id: 'series-a', name: 'Series A' },
    { id: 'series-b', name: 'Series B+' }
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
        ...prev[parent as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const addRequirement = () => {
    if (newRequirement.trim() && !formData.requirements.includes(newRequirement.trim())) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (requirementToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter(req => req !== requirementToRemove)
    }));
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.name && formData.description && formData.industry;
      case 2:
        return formData.location && formData.funding && formData.equity;
      case 3:
        return formData.requirements.length > 0 && formData.contact.email;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!currentUser) return;

    try {
      setIsSubmitting(true);

      const startupData = {
        name: formData.name,
        description: formData.description,
        industry: formData.industry,
        stage: formData.stage,
        location: formData.location,
        funding: formData.funding,
        equity: formData.equity,
        requirements: formData.requirements,
        contact: formData.contact,
        additionalInfo: formData.additionalInfo,
        createdBy: currentUser.uid,
        status: 'active' as const,
        applicants: [],
        applicantCount: 0
      };

      await createStartup(startupData);
      onSuccess();
      onClose();

      // Reset form
      setFormData({
        name: '',
        description: '',
        industry: '',
        stage: 'pre-seed',
        location: '',
        funding: '',
        equity: '',
        requirements: [],
        contact: {
          email: '',
          website: '',
          linkedin: ''
        },
        additionalInfo: ''
      });
      setCurrentStep(1);
    } catch (error) {
      console.error('Error creating startup:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">List Your Startup</h2>
                <p className="text-gray-600 dark:text-gray-400">Step {currentStep} of 3</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-8">
              <motion.div
                className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / 3) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Basic Information</h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Startup Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter your startup name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                      placeholder="Describe your startup, mission, and what you're building..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Industry *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {industries.map((industry) => {
                        const Icon = industry.icon;
                        return (
                          <motion.button
                            key={industry.id}
                            type="button"
                            onClick={() => handleInputChange('industry', industry.name)}
                            className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                              formData.industry === industry.name
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                                : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-500'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {industry.name}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Stage
                    </label>
                    <select
                      value={formData.stage}
                      onChange={(e) => handleInputChange('stage', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                    >
                      {stages.map((stage) => (
                        <option key={stage.id} value={stage.id}>
                          {stage.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Funding & Location */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Funding & Location</h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                      placeholder="City, Country"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Funding Status *
                    </label>
                    <input
                      type="text"
                      value={formData.funding}
                      onChange={(e) => handleInputChange('funding', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                      placeholder="e.g., $500K raised, Seeking $250K, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Equity Offered *
                    </label>
                    <input
                      type="text"
                      value={formData.equity}
                      onChange={(e) => handleInputChange('equity', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                      placeholder="e.g., 2-5%, 5-10%, etc."
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Requirements & Contact */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Requirements & Contact</h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Skills & Requirements *
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newRequirement}
                        onChange={(e) => setNewRequirement(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                        className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                        placeholder="Add a skill or requirement"
                      />
                      <motion.button
                        type="button"
                        onClick={addRequirement}
                        className="px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Plus className="w-5 h-5" />
                      </motion.button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.requirements.map((req, index) => (
                        <motion.span
                          key={index}
                          className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm flex items-center gap-2"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          {req}
                          <button
                            onClick={() => removeRequirement(req)}
                            className="hover:text-emerald-900 dark:hover:text-emerald-100"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      value={formData.contact.email}
                      onChange={(e) => handleNestedChange('contact', 'email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={formData.contact.website}
                      onChange={(e) => handleNestedChange('contact', 'website', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                      placeholder="https://yourstartup.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      value={formData.contact.linkedin}
                      onChange={(e) => handleNestedChange('contact', 'linkedin', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                      placeholder="https://linkedin.com/company/yourstartup"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Additional Information
                    </label>
                    <textarea
                      value={formData.additionalInfo}
                      onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                      placeholder="Any additional information about your startup..."
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <motion.button
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  currentStep === 1
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
                whileHover={{ scale: currentStep === 1 ? 1 : 1.02 }}
                whileTap={{ scale: currentStep === 1 ? 1 : 0.98 }}
              >
                Previous
              </motion.button>

              {currentStep < 3 ? (
                <motion.button
                  onClick={nextStep}
                  disabled={!validateStep(currentStep)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    validateStep(currentStep)
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                  }`}
                  whileHover={{ scale: validateStep(currentStep) ? 1.02 : 1 }}
                  whileTap={{ scale: validateStep(currentStep) ? 0.98 : 1 }}
                >
                  Next
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !validateStep(currentStep)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    isSubmitting || !validateStep(currentStep)
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:shadow-lg'
                  }`}
                  whileHover={{ scale: isSubmitting || !validateStep(currentStep) ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting || !validateStep(currentStep) ? 1 : 0.98 }}
                >
                  {isSubmitting ? 'Creating...' : 'Create Startup'}
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateStartupModal;
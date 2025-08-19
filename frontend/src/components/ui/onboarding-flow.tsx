import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  User, 
  Briefcase, 
  Target, 
  Users,
  Code,
  Palette,
  Megaphone,
  BarChart,
  Globe,
  MapPin,
  Star,
  TrendingUp,
  DollarSign,
  Settings
} from 'lucide-react';

interface OnboardingData {
  role: string;
  skills: string[];
  interests: string[];
  experience: string;
  location: string;
  goals: string[];
  availability: string;
}

interface OnboardingFlowProps {
  isOpen: boolean;
  onComplete: (data: OnboardingData) => void;
  onSkip: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  isOpen,
  onComplete,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    role: '',
    skills: [],
    interests: [],
    experience: '',
    location: '',
    goals: [],
    availability: ''
  });

  const steps = [
    {
      title: "What's your primary role?",
      subtitle: "Help us understand how you'd like to use EarnBuddy",
      component: RoleStep
    },
    {
      title: "What are your skills?",
      subtitle: "Select your areas of expertise",
      component: SkillsStep
    },
    {
      title: "What interests you?",
      subtitle: "Choose topics you'd like to explore",
      component: InterestsStep
    },
    {
      title: "Tell us about your experience",
      subtitle: "This helps us match you with the right opportunities",
      component: ExperienceStep
    },
    {
      title: "Where are you located?",
      subtitle: "We'll show you relevant local and remote opportunities",
      component: LocationStep
    },
    {
      title: "What are your goals?",
      subtitle: "What do you hope to achieve on EarnBuddy?",
      component: GoalsStep
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(data);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateData = (key: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Step {currentStep + 1} of {steps.length}
                </span>
                <button
                  onClick={onSkip}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Skip for now
                </button>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-emerald-600 to-emerald-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Step Content */}
            <div className="mb-8">
              <motion.h2
                className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
                key={`title-${currentStep}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {steps[currentStep].title}
              </motion.h2>
              <motion.p
                className="text-gray-600 dark:text-gray-400"
                key={`subtitle-${currentStep}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                {steps[currentStep].subtitle}
              </motion.p>
            </div>

            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CurrentStepComponent data={data} updateData={updateData} />
            </motion.div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <motion.button
                onClick={nextStep}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    <Check className="w-4 h-4" />
                    Complete Setup
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Step Components
const RoleStep: React.FC<{ data: OnboardingData; updateData: (key: keyof OnboardingData, value: any) => void }> = ({ data, updateData }) => {
  const roles = [
    { id: 'freelancer', label: 'Freelancer', icon: Briefcase, description: 'I want to find projects and clients' },
    { id: 'founder', label: 'Startup Founder', icon: Target, description: 'I\'m building a startup and need co-founders/team' },
    { id: 'builder', label: 'Builder/Creator', icon: User, description: 'I want to collaborate on projects and ideas' },
    { id: 'investor', label: 'Investor/Mentor', icon: Star, description: 'I want to support and invest in startups' },
    { id: 'explorer', label: 'Just Exploring', icon: Globe, description: 'I\'m here to learn and discover opportunities' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {roles.map(role => (
        <motion.button
          key={role.id}
          onClick={() => updateData('role', role.id)}
          className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
            data.role === role.id
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <role.icon className={`w-8 h-8 mb-3 ${
            data.role === role.id ? 'text-emerald-600' : 'text-gray-600 dark:text-gray-400'
          }`} />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{role.label}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{role.description}</p>
        </motion.button>
      ))}
    </div>
  );
};

const SkillsStep: React.FC<{ data: OnboardingData; updateData: (key: keyof OnboardingData, value: any) => void }> = ({ data, updateData }) => {
  const skills = [
    { id: 'frontend', label: 'Frontend Development', icon: Code },
    { id: 'backend', label: 'Backend Development', icon: Code },
    { id: 'design', label: 'UI/UX Design', icon: Palette },
    { id: 'marketing', label: 'Digital Marketing', icon: Megaphone },
    { id: 'data', label: 'Data Science', icon: BarChart },
    { id: 'mobile', label: 'Mobile Development', icon: Code },
    { id: 'blockchain', label: 'Blockchain', icon: Globe },
    { id: 'ai', label: 'AI/Machine Learning', icon: Code },
    { id: 'product', label: 'Product Management', icon: Target },
    { id: 'sales', label: 'Sales & Business Development', icon: TrendingUp },
    { id: 'finance', label: 'Finance & Accounting', icon: DollarSign },
    { id: 'operations', label: 'Operations & Strategy', icon: Settings }
  ];

  const toggleSkill = (skillId: string) => {
    const currentSkills = data.skills;
    if (currentSkills.includes(skillId)) {
      updateData('skills', currentSkills.filter(s => s !== skillId));
    } else {
      updateData('skills', [...currentSkills, skillId]);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {skills.map(skill => (
        <motion.button
          key={skill.id}
          onClick={() => toggleSkill(skill.id)}
          className={`p-4 rounded-xl border-2 transition-all duration-300 ${
            data.skills.includes(skill.id)
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <skill.icon className={`w-6 h-6 mb-2 mx-auto ${
            data.skills.includes(skill.id) ? 'text-emerald-600' : 'text-gray-600 dark:text-gray-400'
          }`} />
          <p className="text-sm font-medium text-gray-900 dark:text-white">{skill.label}</p>
        </motion.button>
      ))}
    </div>
  );
};

const InterestsStep: React.FC<{ data: OnboardingData; updateData: (key: keyof OnboardingData, value: any) => void }> = ({ data, updateData }) => {
  const interests = [
    'AI & Machine Learning',
    'Web3 & Blockchain',
    'Climate Tech',
    'FinTech',
    'HealthTech',
    'EdTech',
    'E-commerce',
    'SaaS',
    'Mobile Apps',
    'Gaming',
    'IoT',
    'Cybersecurity',
    'Social Impact',
    'Creator Economy',
    'Remote Work Tools',
    'Developer Tools'
  ];

  const toggleInterest = (interest: string) => {
    const currentInterests = data.interests;
    if (currentInterests.includes(interest)) {
      updateData('interests', currentInterests.filter(i => i !== interest));
    } else {
      updateData('interests', [...currentInterests, interest]);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {interests.map(interest => (
        <motion.button
          key={interest}
          onClick={() => toggleInterest(interest)}
          className={`p-3 rounded-lg border transition-all duration-300 text-sm ${
            data.interests.includes(interest)
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
              : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600 text-gray-700 dark:text-gray-300'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {interest}
        </motion.button>
      ))}
    </div>
  );
};

const ExperienceStep: React.FC<{ data: OnboardingData; updateData: (key: keyof OnboardingData, value: any) => void }> = ({ data, updateData }) => {
  const experiences = [
    { id: 'student', label: 'Student/Learning', description: 'Currently studying or learning new skills' },
    { id: 'beginner', label: 'Just getting started', description: '0-2 years of experience' },
    { id: 'intermediate', label: 'Some experience', description: '2-5 years of experience' },
    { id: 'experienced', label: 'Experienced professional', description: '5-10 years of experience' },
    { id: 'expert', label: 'Senior expert', description: '10+ years of experience' },
    { id: 'executive', label: 'Executive/Leadership', description: 'C-level or senior leadership experience' }
  ];

  return (
    <div className="space-y-3">
      {experiences.map(exp => (
        <motion.button
          key={exp.id}
          onClick={() => updateData('experience', exp.id)}
          className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
            data.experience === exp.id
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600'
          }`}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <h3 className="font-semibold text-gray-900 dark:text-white">{exp.label}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{exp.description}</p>
        </motion.button>
      ))}
    </div>
  );
};

const LocationStep: React.FC<{ data: OnboardingData; updateData: (key: keyof OnboardingData, value: any) => void }> = ({ data, updateData }) => {
  return (
    <div className="space-y-4">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={data.location}
          onChange={(e) => updateData('location', e.target.value)}
          placeholder="Enter your city, state, or country"
          className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>
      
      <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
        <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <div>
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Open to remote work?
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            We'll show you both local and remote opportunities
          </p>
        </div>
      </div>
    </div>
  );
};

const GoalsStep: React.FC<{ data: OnboardingData; updateData: (key: keyof OnboardingData, value: any) => void }> = ({ data, updateData }) => {
  const goals = [
    'Find freelance projects',
    'Build a startup',
    'Join a startup team',
    'Network with other builders',
    'Learn new skills',
    'Find a co-founder',
    'Invest in startups',
    'Mentor others',
    'Transition to tech career',
    'Scale my business',
    'Find remote work opportunities',
    'Build a personal brand'
  ];

  const toggleGoal = (goal: string) => {
    const currentGoals = data.goals;
    if (currentGoals.includes(goal)) {
      updateData('goals', currentGoals.filter(g => g !== goal));
    } else {
      updateData('goals', [...currentGoals, goal]);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {goals.map(goal => (
        <motion.button
          key={goal}
          onClick={() => toggleGoal(goal)}
          className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
            data.goals.includes(goal)
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
              data.goals.includes(goal)
                ? 'border-emerald-500 bg-emerald-500'
                : 'border-gray-300 dark:border-gray-600'
            }`}>
              {data.goals.includes(goal) && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="font-medium text-gray-900 dark:text-white">{goal}</span>
          </div>
        </motion.button>
      ))}
    </div>
  );
};
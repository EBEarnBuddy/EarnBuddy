import React from 'react';
import { Timeline } from '@/components/ui/timeline';
import { User, Search, Users, Rocket, ArrowRight, Sparkles } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const timelineData = [
    {
      title: "Step 1 – Create Your Profile",
      content: (
        <div className="bg-white dark:bg-black rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-emerald-500/20 relative overflow-hidden glow-border">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-600 to-emerald-400"></div>
          
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl flex items-center justify-center relative">
              <User className="w-8 h-8 text-white" />
              <div className="absolute inset-0 bg-emerald-500/30 rounded-xl blur-lg animate-pulse"></div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                Answer a few quick questions to personalize your journey:
                <Sparkles className="w-5 h-5 text-emerald-500" />
              </h3>
              
              <ul className="space-y-3">
                <li className="flex items-start space-x-3 group">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0 group-hover:scale-150 transition-transform"></div>
                  <span className="text-gray-700 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Into startups? Let us know if you're a founder or operator.</span>
                </li>
                <li className="flex items-start space-x-3 group">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0 group-hover:scale-150 transition-transform"></div>
                  <span className="text-gray-700 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Freelancing? Share your skills and preferred collab styles.</span>
                </li>
                <li className="flex items-start space-x-3 group">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0 group-hover:scale-150 transition-transform"></div>
                  <span className="text-gray-700 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Just exploring? No pressure—discover at your own pace.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Step 2 – Explore Your Niche",
      content: (
        <div className="bg-white dark:bg-black rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-emerald-500/20 relative overflow-hidden glow-border">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-600 to-emerald-400"></div>
          
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl flex items-center justify-center relative">
              <Search className="w-8 h-8 text-white" />
              <div className="absolute inset-0 bg-emerald-500/30 rounded-xl blur-lg animate-pulse"></div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                Browse live startups, freelance gigs, and builder pods across industries.
              </h3>
              
              <ul className="space-y-3">
                <li className="flex items-start space-x-3 group">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0 group-hover:scale-150 transition-transform"></div>
                  <span className="text-gray-700 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Find where you belong. Connect deeply.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Step 3 – Collaborate with Purpose",
      content: (
        <div className="bg-white dark:bg-black rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-emerald-500/20 relative overflow-hidden glow-border">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-600 to-emerald-400"></div>
          
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl flex items-center justify-center relative">
              <Users className="w-8 h-8 text-white" />
              <div className="absolute inset-0 bg-emerald-500/30 rounded-xl blur-lg animate-pulse"></div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                Apply to pods, gigs, and early-stage ideas that resonate.
              </h3>
              
              <ul className="space-y-3">
                <li className="flex items-start space-x-3 group">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0 group-hover:scale-150 transition-transform"></div>
                  <span className="text-gray-700 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Match based on energy and ambition—not just skill keywords.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Step 4 – Start Something of Your Own",
      content: (
        <div className="bg-white dark:bg-black rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-emerald-500/20 relative overflow-hidden glow-border">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-600 to-emerald-400"></div>
          
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl flex items-center justify-center relative">
              <Rocket className="w-8 h-8 text-white" />
              <div className="absolute inset-0 bg-emerald-500/30 rounded-xl blur-lg animate-pulse"></div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                Ready to build? We've got your back:
              </h3>
              
              <ul className="space-y-3">
                <li className="flex items-start space-x-3 group">
                  <ArrowRight className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                  <span className="text-gray-700 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Team-building support</span>
                </li>
                <li className="flex items-start space-x-3 group">
                  <ArrowRight className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                  <span className="text-gray-700 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Creator Rooms for async productivity</span>
                </li>
                <li className="flex items-start space-x-3 group">
                  <ArrowRight className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                  <span className="text-gray-700 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Access to mentorship, incubation and funding</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="bg-gray-50 dark:bg-black">
      <Timeline data={timelineData} />
    </section>
  );
};

export default HowItWorks;
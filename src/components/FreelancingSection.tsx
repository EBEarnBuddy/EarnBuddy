import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Star, Target, Handshake, Eye, CreditCard, Sparkles, Zap } from 'lucide-react';

const FreelancingSection: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: Target,
      title: "Showcase your profile with aligned intent",
      description: "Build a reputation that speaks to your values and goals"
    },
    {
      icon: Handshake,
      title: "Apply once, build long-term collaborations",
      description: "Move beyond one-off gigs to meaningful partnerships"
    },
    {
      icon: Star,
      title: "Access Colance mode to co-own ideas",
      description: "Transition from freelancer to co-creator when the fit is right"
    },
    {
      icon: Eye,
      title: "Feature on Talent Walls visible to founders",
      description: "Get discovered by startups looking for your exact skillset"
    },
    {
      icon: CreditCard,
      title: "Manage tasks, payments, and collab history seamlessly",
      description: "All-in-one workspace for professional collaboration"
    }
  ];

  return (
    <section id="freelancing" className="py-20 bg-gray-50 dark:bg-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-emerald-400/5 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          ref={ref}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Zap className="w-4 h-4 text-emerald-500" />
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">For Freelancers</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800 dark:text-white">
            Not another gig platform. A{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
              reputation-building
            </span>{' '}
            network.
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto">
            Build lasting collaborations that grow your skills, network, and earning potential 🚀
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="group"
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-emerald-500/20 h-full relative overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:scale-105 group-hover:border-emerald-500/40">
                  {/* Glow effect */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400/20 to-lime-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl flex items-center justify-center mb-4 relative">
                      <feature.icon className="w-6 h-6 text-white" />
                      <div className="absolute inset-0 bg-emerald-500/30 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                      {feature.title}
                      <Sparkles className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FreelancingSection;
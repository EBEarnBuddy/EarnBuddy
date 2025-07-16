import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Users, GitBranch, TrendingUp, Calendar, Play } from 'lucide-react';

const HeroSection: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const [typedText, setTypedText] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const titleY = useTransform(scrollYProgress, [0, 0.3], [0, -100]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  
  const mockupY = useTransform(scrollYProgress, [0, 0.5], [0, -200]);
  const mockupScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.1]);
  const mockupRotateX = useTransform(scrollYProgress, [0, 0.5], [0, 15]);

  const words = ['Build.', 'Collaborate.', 'Earn.'];
  
  useEffect(() => {
    const currentWord = words[currentWordIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (typedText.length < currentWord.length) {
          setTypedText(currentWord.slice(0, typedText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 1500);
        }
      } else {
        if (typedText.length > 0) {
          setTypedText(typedText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    }, isDeleting ? 50 : 150);

    return () => clearTimeout(timeout);
  }, [typedText, isDeleting, currentWordIndex, words]);

  const floatingElements = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 2,
    size: 2 + Math.random() * 4,
  }));

  return (
    <section className="min-h-screen bg-white dark:bg-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating particles */}
        {floatingElements.map((element) => (
          <motion.div
            key={element.id}
            className="absolute rounded-full bg-emerald-500/30"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              width: `${element.size}px`,
              height: `${element.size}px`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: element.duration,
              repeat: Infinity,
              delay: element.delay,
            }}
          />
        ))}
        
        {/* Gradient orbs */}
        <motion.div 
          className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-emerald-400/20 to-emerald-600/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div 
          className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-tr from-lime-400/20 to-emerald-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Circular particle animations */}
        <div className="absolute inset-0">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-emerald-500 rounded-full"
              style={{
                left: '50%',
                top: '50%',
              }}
              animate={{
                x: [0, Math.cos(i * Math.PI / 4) * 200],
                y: [0, Math.sin(i * Math.PI / 4) * 200],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="max-w-7xl mx-auto">
          {/* Header Content */}
          <motion.div 
            className="text-center mb-16 pt-32"
            style={{ y: titleY, opacity: titleOpacity }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500/8 border border-emerald-500/15 rounded-full mb-12 backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className="text-emerald-700 dark:text-emerald-300 font-semibold text-sm tracking-wide">LIVE DEMO</span>
            </motion.div>

            <motion.div 
              className="text-6xl md:text-7xl lg:text-8xl font-black mb-8 leading-[0.9] min-h-[200px] flex items-center justify-center tracking-tight"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-gray-900 via-emerald-600 to-emerald-500 dark:from-white dark:via-emerald-400 dark:to-emerald-300 bg-clip-text text-transparent">
                {typedText}
                <motion.span
                  className="inline-block w-1.5 h-20 bg-emerald-600 dark:bg-emerald-400 ml-3"
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </span>
            </motion.div>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-16 max-w-4xl mx-auto leading-relaxed font-medium"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Where ambitious builders come together to turn ideas into reality. Experience the full platform now.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.a 
                href="/auth"
                className="group relative px-10 py-5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold rounded-2xl overflow-hidden shadow-xl shadow-emerald-500/25 hover:shadow-2xl hover:shadow-emerald-500/40"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <span className="relative z-10 text-lg">
                  Try Demo Now
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-lime-400"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "0%" }}
                  transition={{ duration: 0.3 }}
                />
                <div className="absolute inset-0 bg-emerald-500/30 blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              </motion.a>
              
              <motion.a 
                href="#how-it-works"
                className="group px-10 py-5 border-2 border-emerald-600/20 text-emerald-700 dark:text-emerald-300 font-bold rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-300 relative overflow-hidden backdrop-blur-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <span className="text-lg relative z-10">Learn More</span>
                <motion.div
                  className="absolute inset-0 bg-emerald-500/8"
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.a>
            </motion.div>
          </motion.div>

          {/* Mockup Dashboard */}
          <div className="relative max-w-6xl mx-auto">
            <motion.div 
              className="relative"
              style={{ 
                y: mockupY, 
                scale: mockupScale,
                rotateX: mockupRotateX,
                transformPerspective: 1200
              }}
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden backdrop-blur-xl">
                {/* Dashboard Header */}
                <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 p-8 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                        <img src="/logofinal.png" alt="EarnBuddy" className="w-7 h-7" />
                      </div>
                      <h3 className="text-2xl font-bold tracking-tight">EarnBuddy Dashboard</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="relative p-10 bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-sm">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                      <motion.div 
                        className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-8 shadow-lg border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="text-xl font-bold text-gray-900 dark:text-white">Active Projects</h4>
                          <span className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 rounded-full text-sm font-semibold">Live Demo</span>
                        </div>
                        
                        <div className="space-y-6">
                          {[
                            { name: "AI Startup Collaboration", progress: 85, color: "emerald", members: 4 },
                            { name: "Web3 DeFi Platform", progress: 65, color: "blue", members: 6 },
                            { name: "Climate Tech Solution", progress: 90, color: "purple", members: 3 }
                          ].map((project, idx) => (
                            <motion.div 
                              key={idx}
                              className="flex items-center justify-between p-5 bg-gray-50/80 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-600/50 transition-all duration-300 cursor-pointer border border-transparent hover:border-emerald-500/30 hover:shadow-md"
                              whileHover={{ scale: 1.02, x: 5 }}
                              transition={{ duration: 0.2 }}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.5, delay: 0.9 + idx * 0.1 }}
                            >
                              <div className="flex items-center space-x-4">
                                <div className={`w-4 h-4 bg-${project.color}-500 rounded-full shadow-sm`}></div>
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-white">{project.name}</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">{project.members} collaborators</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-3 shadow-inner">
                                  <motion.div 
                                    className={`h-3 bg-gradient-to-r from-${project.color}-500 to-${project.color}-400 rounded-full shadow-sm`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${project.progress}%` }}
                                    transition={{ duration: 1, delay: 1.2 + idx * 0.2 }}
                                  ></motion.div>
                                </div>
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300 min-w-[3rem]">{project.progress}%</span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                      {/* Stats Cards */}
                      <div className="grid grid-cols-1 gap-6">
                        {[
                          { icon: Users, label: "Collaborators", value: "2.4k", color: "emerald" },
                          { icon: GitBranch, label: "Projects", value: "156", color: "blue" },
                          { icon: TrendingUp, label: "Success Rate", value: "94%", color: "purple" },
                          { icon: Calendar, label: "This Month", value: "23", color: "orange" }
                        ].map((stat, idx) => (
                          <motion.div 
                            key={idx}
                            className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:border-emerald-500/40 transition-all duration-300 backdrop-blur-xl"
                            whileHover={{ scale: 1.05, y: -5 }}
                            transition={{ duration: 0.2 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 1 + idx * 0.1 }}
                          >
                            <div className={`w-12 h-12 bg-${stat.color}-100 dark:bg-${stat.color}-900/30 rounded-xl flex items-center justify-center mb-4 shadow-sm`}>
                              <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                            </div>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">{stat.label}</p>
                          </motion.div>
                        ))}
                      </div>

                      {/* Quick Actions */}
                      <motion.div 
                        className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-8 shadow-lg border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 1.4 }}
                      >
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h4>
                        <div className="space-y-3">
                          <motion.button
                            className="w-full p-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Start New Project
                          </motion.button>
                          <motion.button
                            className="w-full p-3 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Find Collaborators
                          </motion.button>
                          <motion.button
                            className="w-full p-3 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Browse Opportunities
                          </motion.button>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white dark:from-black to-transparent pointer-events-none"></div>
    </section>
  );
};

export default HeroSection;
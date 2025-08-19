import React, { useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';
import { ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';

const FAQSection: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How does EarnBuddy work?",
      answer: "EarnBuddy connects builders, creators, and entrepreneurs through community pods, freelance opportunities, and startup collaborations. Join pods based on your interests, find freelance gigs that match your skills, or discover startup opportunities to join as a co-founder or early team member."
    },
    {
      question: "Is EarnBuddy free to use?",
      answer: "Yes! EarnBuddy is completely free to join and use. You can create your profile, join pods, browse opportunities, and connect with other builders at no cost. We believe in building an accessible platform for everyone."
    },
    {
      question: "How do I get started?",
      answer: "Simply sign up with your email or Google account, complete your profile with your skills and interests, and start exploring! You can join relevant pods, browse freelance gigs, check out startup opportunities, or create your own projects."
    },
    {
      question: "What types of opportunities are available?",
      answer: "We have a wide range of opportunities including freelance projects (development, design, marketing), startup co-founder positions, early-stage team roles, community building projects, and collaborative ventures across various industries like AI, Web3, Climate Tech, and more."
    },
    {
      question: "How does the matching system work?",
      answer: "Our platform matches you based on your skills, interests, experience level, and collaboration preferences. We focus on creating meaningful connections rather than just skill-based matching, ensuring you find opportunities and collaborators that align with your goals and values."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-white dark:bg-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          ref={ref}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800 dark:text-white">
            Frequently Asked{' '}
            <span className="text-emerald-600 dark:text-emerald-400">
              Questions
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Everything you need to know about building with EarnBuddy
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="mb-4"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300">
                <motion.button
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 group"
                  onClick={() => toggleFAQ(index)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white pr-4 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {faq.question}
                  </h3>
                  <div className="flex-shrink-0">
                    <motion.div
                      animate={{ rotate: openIndex === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {openIndex === index ? (
                        <ChevronUp className="w-6 h-6 text-emerald-600" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                      )}
                    </motion.div>
                  </div>
                </motion.button>
                
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-8 pb-6">
                        <div className="w-full h-px bg-gradient-to-r from-emerald-200 dark:from-emerald-800 to-transparent mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="bg-gradient-to-r from-emerald-50 dark:from-emerald-900/20 to-lime-50 dark:to-lime-900/20 rounded-2xl p-8 border border-emerald-100 dark:border-emerald-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                Ready to Start Building?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Join thousands of builders who are already collaborating and earning together.
              </p>
              <motion.a
                href="/auth"
                className="group relative px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-xl overflow-hidden inline-flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <span className="relative z-10">Get Started Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-lime-400"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "0%" }}
                  transition={{ duration: 0.3 }}
                />
                <div className="absolute inset-0 bg-emerald-500/30 blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
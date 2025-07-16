import React from 'react';
import { motion } from 'framer-motion';
import { Twitter, Linkedin, Heart, ArrowRight } from 'lucide-react';

export const ModernFooter: React.FC = () => {
  const footerSections = [
    {
      title: "Discover",
      links: [
        { name: "Explore Pods", href: "/discover" },
        { name: "Find Freelancers", href: "/discover" },
        { name: "Browse Startups", href: "/discover" },
        { name: "Join Communities", href: "/discover" }
      ]
    },
    {
      title: "Build",
      links: [
        { name: "Freelance", href: "/freelance" },
        { name: "Startups", href: "/startups" },
        { name: "Pods", href: "/community" },
        { name: "Rooms", href: "/community" }
      ]
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", href: "#" },
        { name: "Community Guidelines", href: "#" },
        { name: "Contact Us", href: "#" },
        { name: "Feedback", href: "/help-us-make-it-better" }
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About", href: "#" },
        { name: "Blog", href: "#" },
        { name: "Careers", href: "#" },
        { name: "Press", href: "#" }
      ]
    }
  ];

  return (
    <footer className="bg-gray-900 dark:bg-gray-900 text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="container mx-auto px-6 py-20 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div 
              className="flex items-center space-x-3 mb-6"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="relative">
                <img 
                  src="/logofinal.png" 
                  alt="EarnBuddy" 
                  className="w-12 h-12 object-contain"
                />
                <div className="absolute inset-0 bg-emerald-500/20 rounded-lg blur-lg animate-pulse"></div>
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-lime-400 bg-clip-text text-transparent">
                EarnBuddy
              </span>
            </motion.div>
            
            <p className="text-gray-400 text-lg mb-8 max-w-md leading-relaxed">
              Where ambitious builders come together to turn ideas into reality. 
              Build. Collaborate. Earn.
            </p>
            
            <div className="flex space-x-4">
              <motion.a
                href="https://twitter.com/earnbuddy"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-blue-600 transition-all duration-300 relative overflow-hidden group"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
              >
                <Twitter className="w-6 h-6 relative z-10" />
                <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.a>
              <motion.a
                href="https://linkedin.com/company/earnbuddy"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all duration-300 relative overflow-hidden group"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
              >
                <Linkedin className="w-6 h-6 relative z-10" />
                <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.a>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={section.title}>
              <h3 className="text-lg font-semibold mb-6 text-emerald-400">
                {section.title}
              </h3>
              <ul className="space-y-4">
                {section.links.map((link, linkIndex) => (
                  <motion.li 
                    key={link.name}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: linkIndex * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-emerald-400 transition-colors duration-200 relative group"
                    >
                      {link.name}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-400 transition-all duration-300 group-hover:w-full"></span>
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 EarnBuddy. All rights reserved.
            </p>
            
            <div className="flex items-center space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">
                Terms of Service
              </a>
              <div className="flex items-center space-x-2 text-gray-400">
                <span>Made with</span>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Heart className="w-4 h-4 text-red-500 fill-current" />
                </motion.div>
                <span>by builders, for builders</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
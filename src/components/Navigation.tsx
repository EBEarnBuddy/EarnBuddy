import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, ArrowUp } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GlassMorphism } from './ui/glass-morphism';
import { GradientButton } from './ui/gradient-button';

const Navigation: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 20);
      setShowScrollTop(scrollPosition > 500);

      // Update active section based on scroll position
      const sections = ['how-it-works', 'startups', 'freelancing', 'community', 'testimonials', 'faq'];
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      setActiveSection(currentSection || '');
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Startups', href: '#startups' },
    { name: 'Freelancing', href: '#freelancing' },
    { name: 'Community', href: '#community' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'FAQ', href: '#faq' }
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setIsMobileMenuOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleAuthClick = (isSignUp: boolean = false) => {
    navigate('/auth', { state: { isSignUp } });
  };

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-out ${
          isScrolled
            ? 'mx-4 mt-4'
            : ''
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
      >
        <GlassMorphism
          intensity={isScrolled ? 'heavy' : 'light'}
          className={`${isScrolled ? 'rounded-2xl shadow-2xl' : 'rounded-none'} border-0 ${isScrolled ? 'border' : ''} border-white/20 dark:border-gray-700/20`}
        >
          <div className={`${isScrolled ? 'px-4 sm:px-8 py-4' : 'container mx-auto px-4 sm:px-8 py-6'}`}>
            <div className="flex items-center justify-between">
              {/* Logo */}
              <motion.div
                className="flex items-center space-x-4 cursor-pointer"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                onClick={() => navigate('/')}
              >
                <div className="relative group">
                  <img
                    src="/logofinal.png"
                    alt="EarnBuddy"
                    className="w-8 h-8 sm:w-10 sm:h-10 object-contain transition-all duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-lg blur-lg animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <span className="text-lg sm:text-xl font-bold">
                  <span className="text-emerald-600 dark:text-emerald-400">Earn</span><span className="text-lime-600 dark:text-lime-400">Buddy</span>
                </span>
              </motion.div>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-2 xl:space-x-4">
                {navItems.map((item, index) => {
                  const sectionId = item.href.replace('#', '');
                  const isActive = activeSection === sectionId;

                  return (
                    <motion.button
                      key={item.name}
                      onClick={() => scrollToSection(item.href)}
                      className={`relative px-3 xl:px-6 py-3 font-medium transition-all duration-300 ease-out rounded-xl group text-sm xl:text-base ${
                        isActive
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      {item.name}
                      {isActive && (
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50"
                          layoutId="activeSection"
                          initial={{ opacity: 0, scaleX: 0 }}
                          animate={{ opacity: 1, scaleX: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Auth Buttons */}
              <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
                <motion.button
                  onClick={() => handleAuthClick(false)}
                  className="px-3 lg:px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors text-sm lg:text-base"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign In
                </motion.button>
                <GradientButton
                  onClick={() => handleAuthClick(true)}
                  className="shadow-lg hover:shadow-emerald-500/25 px-3 lg:px-6 py-3 text-sm lg:text-base"
                >
                  Get Started
                </GradientButton>
              </div>

              {/* Mobile Menu Button */}
              <div className="lg:hidden flex items-center space-x-2">
                <motion.button
                  className="p-2 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isMobileMenuOpen ? (
                      <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    ) : (
                      <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    )}
                  </motion.div>
                </motion.button>
              </div>
            </div>

            {/* Mobile Menu */}
            <motion.div
              className={`lg:hidden overflow-hidden ${
                isMobileMenuOpen ? 'max-h-96' : 'max-h-0'
              }`}
              initial={false}
              animate={{
                height: isMobileMenuOpen ? 'auto' : 0
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="py-4 space-y-2 border-t border-white/20 dark:border-gray-700/20 mt-4">
                {navItems.map((item, index) => {
                  const sectionId = item.href.replace('#', '');
                  const isActive = activeSection === sectionId;

                  return (
                    <motion.button
                      key={item.name}
                      onClick={() => scrollToSection(item.href)}
                      className={`block w-full text-left py-3 px-4 font-medium transition-all duration-300 rounded-xl ${
                        isActive
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400'
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ x: 5 }}
                    >
                      {item.name}
                      {isActive && (
                        <motion.div
                          className="w-full h-0.5 bg-emerald-500 rounded-full mt-2 shadow-lg shadow-emerald-500/50"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </motion.button>
                  );
                })}
                <div className="flex flex-col space-y-2 mt-4 mx-4">
                  <motion.button
                    onClick={() => handleAuthClick(false)}
                    className="w-full py-3 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors border border-gray-200 dark:border-gray-700 rounded-xl"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Sign In
                  </motion.button>
                  <GradientButton
                    onClick={() => handleAuthClick(true)}
                    className="w-full"
                  >
                    Get Started
                  </GradientButton>
                </div>
              </div>
            </motion.div>
          </div>
        </GlassMorphism>
      </motion.nav>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <motion.button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowUp className="w-5 h-5" />
          <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>
        </motion.button>
      )}
    </>
  );
};

export default Navigation;
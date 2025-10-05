import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import HowItWorks from './components/HowItWorks';
import StartupsSection from './components/StartupsSection';
import FreelancingSection from './components/FreelancingSection';
import CommunitySection from './components/CommunitySection';
import { ModernTestimonials } from './components/ui/modern-testimonials';
import FAQSection from './components/FAQSection';
import { ModernFooter } from './components/ui/modern-footer';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

function App() {
  const { currentUser, loading, isFirebaseReady } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only redirect if user is authenticated, Firebase is ready, and we're on the landing page
    if (currentUser && isFirebaseReady && !loading && location.pathname === '/') {
      navigate('/discover');
    }
  }, [currentUser, isFirebaseReady, loading, navigate, location.pathname]);

  // Show loading only when Firebase is ready and we're actually loading auth state
  if (loading && isFirebaseReady) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-8 h-8 text-emerald-600" />
          </motion.div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </motion.div>
      </div>
    );
  }

  // Show the landing page for non-authenticated users
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navigation />
      <main>
        <HeroSection />
        <HowItWorks />
        <StartupsSection />
        <FreelancingSection />
        <CommunitySection />
        <ModernTestimonials />
        <FAQSection />
      </main>
      <ModernFooter />
    </div>
  );
}

export default App;
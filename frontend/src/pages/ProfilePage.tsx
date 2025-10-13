import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  MapPin,
  Calendar,
  Star,
  Briefcase,
  Users,
  TrendingUp,
  Award,
  BookOpen,
  Code,
  Palette,
  MessageCircle,
  Settings,
  Camera,
  BarChart3,
  Eye,
  DollarSign,
  Target,
  Activity
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAnalytics, usePods, useRooms } from '../hooks/useFirestore';
import DashboardNavbar from '../components/DashboardNavbar';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { getRecentActivities, getUserAnalytics, Activity as ActivityType } from '../lib/activityService';
import ApplicationsList from '../components/ApplicationsList';
import PostedProjectsList from '../components/PostedProjectsList';

const ProfilePage: React.FC = () => {
  const { currentUser, userProfile, updateProfile } = useAuth();
  const { analytics, loading: analyticsLoading } = useAnalytics();
  const { pods } = usePods();
  const { rooms } = useRooms();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'posted-projects' | 'analytics'>('overview');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoInputRef] = useState(React.createRef<HTMLInputElement>());
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [userAnalytics, setUserAnalytics] = useState<any>(null);
  const [userAnalyticsLoading, setUserAnalyticsLoading] = useState(false);

  // Profile editing state
  const [editedProfile, setEditedProfile] = useState({
    displayName: userProfile?.displayName || '',
    bio: userProfile?.bio || '',
    location: userProfile?.location || '',
    skills: userProfile?.skills || []
  });

  // Skills dropdown state
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(userProfile?.skills || []);

  // Predefined skills list
  const predefinedSkills = [
    'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Node.js', 'Python', 'Java', 'C++', 'C#',
    'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'Dart', 'Flutter', 'React Native', 'Next.js',
    'Nuxt.js', 'Express.js', 'Django', 'Flask', 'Spring Boot', 'Laravel', 'Ruby on Rails', 'ASP.NET',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase', 'AWS', 'Azure', 'Google Cloud', 'Docker',
    'Kubernetes', 'Git', 'GitHub', 'GitLab', 'CI/CD', 'REST API', 'GraphQL', 'WebSocket', 'HTML', 'CSS',
    'Sass', 'Less', 'Tailwind CSS', 'Bootstrap', 'Material-UI', 'Ant Design', 'Figma', 'Adobe XD', 'Sketch',
    'Photoshop', 'Illustrator', 'After Effects', 'Premiere Pro', 'Blender', 'Unity', 'Unreal Engine',
    'Machine Learning', 'Deep Learning', 'Data Science', 'Data Analysis', 'Statistics', 'Mathematics',
    'Blockchain', 'Web3', 'Solidity', 'Smart Contracts', 'Cryptocurrency', 'NFT', 'DeFi', 'Cybersecurity',
    'Penetration Testing', 'Network Security', 'DevOps', 'Linux', 'Windows', 'macOS', 'Mobile Development',
    'iOS Development', 'Android Development', 'Game Development', 'UI/UX Design', 'Product Management',
    'Project Management', 'Agile', 'Scrum', 'Kanban', 'Leadership', 'Communication', 'Public Speaking',
    'Content Writing', 'Copywriting', 'SEO', 'Digital Marketing', 'Social Media Marketing', 'Email Marketing',
    'Google Ads', 'Facebook Ads', 'Analytics', 'Google Analytics', 'Mixpanel', 'Amplitude', 'Sales',
    'Customer Success', 'Support', 'Quality Assurance', 'Testing', 'Automation', 'Selenium', 'Cypress',
    'Jest', 'Mocha', 'Chai', 'JUnit', 'PyTest', 'NUnit', 'Architecture', 'System Design', 'Microservices',
    'Monolith', 'Serverless', 'API Design', 'Database Design', 'Performance Optimization', 'Caching',
    'Load Balancing', 'CDN', 'Monitoring', 'Logging', 'Alerting', 'Incident Response', 'Disaster Recovery',
    'Backup', 'Compliance', 'GDPR', 'HIPAA', 'SOX', 'PCI DSS', 'Accessibility', 'WCAG', 'Internationalization',
    'Localization', 'Translation', 'Documentation', 'Technical Writing', 'Blogging', 'Video Editing',
    'Podcasting', 'Streaming', 'Twitch', 'YouTube', 'TikTok', 'Instagram', 'LinkedIn', 'Twitter',
    'Facebook', 'Discord', 'Slack', 'Microsoft Teams', 'Zoom', 'Google Meet', 'Notion', 'Airtable',
    'Trello', 'Asana', 'Jira', 'Confluence', 'Miro', 'Lucidchart', 'Draw.io', 'Whimsical', 'Framer',
    'Webflow', 'WordPress', 'Shopify', 'WooCommerce', 'Stripe', 'PayPal', 'Square', 'QuickBooks',
    'Salesforce', 'HubSpot', 'Zendesk', 'Intercom', 'Mailchimp', 'SendGrid', 'Twilio', 'Plaid',
    'Algolia', 'Elasticsearch', 'Apache Kafka', 'RabbitMQ', 'Redis', 'Memcached', 'Varnish', 'Nginx',
    'Apache', 'IIS', 'Tomcat', 'Jetty', 'Gunicorn', 'uWSGI', 'PM2', 'Forever', 'Systemd', 'Cron',
    'Ansible', 'Terraform', 'CloudFormation', 'Puppet', 'Chef', 'Salt', 'Jenkins', 'GitLab CI',
    'GitHub Actions', 'CircleCI', 'Travis CI', 'Bamboo', 'TeamCity', 'SonarQube', 'CodeClimate',
    'Coveralls', 'Snyk', 'Dependabot', 'Renovate', 'Greenkeeper', 'npm audit', 'yarn audit'
  ];

  // Filter skills based on input
  const filteredSkills = predefinedSkills.filter(skill =>
    skill.toLowerCase().includes(customSkillInput.toLowerCase()) &&
    !selectedSkills.includes(skill)
  );

  // Add skill to selected list
  const addSkill = (skill: string) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
    }
    setCustomSkillInput('');
    setShowSkillsDropdown(false);
  };

  // Remove skill from selected list
  const removeSkill = (skillToRemove: string) => {
    setSelectedSkills(selectedSkills.filter(skill => skill !== skillToRemove));
  };

  // Handle custom skill input
  const handleCustomSkillInput = (value: string) => {
    setCustomSkillInput(value);
    setShowSkillsDropdown(value.length > 0);
  };

  // Handle Enter key to add custom skill
  const handleCustomSkillKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customSkillInput.trim()) {
      addSkill(customSkillInput.trim());
    }
  };

  // Update local state when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setEditedProfile({
        displayName: userProfile.displayName || '',
        bio: userProfile.bio || '',
        location: userProfile.location || '',
        skills: userProfile.skills || []
      });
      setSelectedSkills(userProfile.skills || []);
    }
  }, [userProfile]);

      // Fetch recent activities and analytics
  const fetchData = async () => {
    setActivitiesLoading(true);
    setUserAnalyticsLoading(true);

    try {
      // Fetch activities and analytics in parallel
      const [recentActivities, analyticsData] = await Promise.all([
        getRecentActivities(5), // Show only 5 most recent activities
        getUserAnalytics()
      ]);

      setActivities(recentActivities);
      setUserAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setActivitiesLoading(false);
      setUserAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // 1. Profile update using Firebase
  const handleSaveProfile = async () => {
    if (!currentUser) return;

    try {
      console.log('Saving profile with data:', {
        displayName: editedProfile.displayName,
        bio: editedProfile.bio,
        location: editedProfile.location,
      });

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        displayName: editedProfile.displayName,
        bio: editedProfile.bio,
        location: editedProfile.location,
        updatedAt: new Date()
      });

      // Update local context
      await updateProfile({
        displayName: editedProfile.displayName,
        bio: editedProfile.bio,
        location: editedProfile.location,
      });

      console.log('Profile updated successfully');
      setIsEditing(false);
    } catch (err: any) {
      console.error('Profile update error:', err);
      alert(`Failed to update profile: ${err.message}`);
    }
  };

  // 2. Profile photo upload using Firebase Storage
  const handleCameraClick = () => {
    if (photoInputRef.current) photoInputRef.current.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !currentUser) {
      console.log('No file selected or no user');
      return;
    }

    const file = e.target.files[0];
    console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setPhotoUploading(true);

    // Add timeout to prevent infinite loading
    const uploadTimeout = setTimeout(() => {
      setPhotoUploading(false);
      alert('Upload timed out. Please try again.');
    }, 30000); // 30 seconds timeout

    // Function to use fallback method
    const useFallbackMethod = async () => {
      console.log('Using fallback method...');
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          const dataURL = event.target?.result as string;
          console.log('Data URL created, updating Firestore...');

          const userRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userRef, {
            photoURL: dataURL,
            updatedAt: new Date()
          });

          // Update local context
          await updateProfile({ photoURL: dataURL });

          clearTimeout(uploadTimeout);
          setPhotoUploading(false);
          console.log('Profile photo updated using fallback method');
          alert('Photo uploaded successfully using fallback method!');

          // Clear the file input
          if (photoInputRef.current) {
            photoInputRef.current.value = '';
          }

        } catch (fallbackError: any) {
          clearTimeout(uploadTimeout);
          setPhotoUploading(false);
          console.error('Fallback method failed:', fallbackError);
          alert('Failed to update profile photo. Please try again.');

          // Clear the file input on error
          if (photoInputRef.current) {
            photoInputRef.current.value = '';
          }
        }
      };

      reader.onerror = () => {
        clearTimeout(uploadTimeout);
        setPhotoUploading(false);
        alert('Failed to read image file. Please try again.');

        // Clear the file input on error
        if (photoInputRef.current) {
          photoInputRef.current.value = '';
        }
      };

      reader.readAsDataURL(file);
    };

    try {
      console.log('Starting photo upload...');
      console.log('User ID:', currentUser.uid);

      // Create a simpler file path
      const fileName = `profile_${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `profiles/${currentUser.uid}/${fileName}`);

      console.log('Storage reference created:', storageRef.fullPath);

      // Upload the file with a promise that can be rejected
      console.log('Uploading file...');

      // Create a promise that will reject on CORS errors
      const uploadPromise = uploadBytes(storageRef, file);

      // Add a timeout to the upload promise
      const uploadWithTimeout = Promise.race([
        uploadPromise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Upload timeout')), 10000)
        )
      ]);

      const snapshot = await uploadWithTimeout;
      console.log('Upload completed, getting download URL...');

      // Get the download URL
      const photoURL = await getDownloadURL(snapshot.ref);
      console.log('Download URL obtained:', photoURL);

      // Update user profile in Firestore
      console.log('Updating Firestore...');
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        photoURL: photoURL,
        updatedAt: new Date()
      });

      console.log('Firestore updated successfully');

      // Update local context
      console.log('Updating local context...');
      await updateProfile({ photoURL });

      clearTimeout(uploadTimeout);
      setPhotoUploading(false);
      console.log('Profile photo updated successfully');

      // Clear the file input
      if (photoInputRef.current) {
        photoInputRef.current.value = '';
      }

    } catch (err: any) {
      clearTimeout(uploadTimeout);
      console.error('Photo upload error:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);

      // Check if it's a CORS or network error
      if (err.message.includes('CORS') ||
          err.message.includes('network') ||
          err.message.includes('ERR_FAILED') ||
          err.code === 'storage/unauthorized' ||
          err.message.includes('timeout')) {

        console.log('CORS/Network error detected, using fallback method...');
        await useFallbackMethod();
        return;
      }

      setPhotoUploading(false);

      // Provide specific error messages
      let errorMessage = 'Failed to upload photo';
      if (err.code === 'storage/unauthorized') {
        errorMessage = 'Upload not authorized. Please check Firebase Storage rules.';
      } else if (err.code === 'storage/quota-exceeded') {
        errorMessage = 'Storage quota exceeded. Please try a smaller image.';
      } else if (err.code === 'storage/retry-limit-exceeded') {
        errorMessage = 'Upload failed. Please check your internet connection and try again.';
      } else if (err.code === 'storage/object-not-found') {
        errorMessage = 'Upload failed. Please try again.';
      } else {
        errorMessage = `Upload failed: ${err.message}`;
      }

      alert(errorMessage);

      // Clear the file input on error
      if (photoInputRef.current) {
        photoInputRef.current.value = '';
      }
    }
  };

  // 3. Skills edit using Firebase
  const handleSaveSkills = async () => {
    if (!currentUser) return;

    const skillsArr = selectedSkills;

    try {
      console.log('Saving skills:', skillsArr);

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        skills: skillsArr,
        updatedAt: new Date()
      });

      // Update local context
      await updateProfile({ skills: skillsArr });

      setIsEditingSkills(false);
      console.log('Skills updated successfully');
    } catch (err: any) {
      console.error('Skills update error:', err);
      alert(`Failed to update skills: ${err.message}`);
    }
  };

  const joinedPods = currentUser ? pods.filter(p => p.members.includes(currentUser.uid)) : [];
  const joinedRooms = currentUser ? rooms.filter(r => r.members.includes(currentUser.uid)) : [];

  const stats = [
    { label: 'Projects Created', value: userAnalytics?.projectsCreated || 0, icon: MessageCircle },
    { label: 'Projects Applied', value: userAnalytics?.projectsApplied || 0, icon: Briefcase },
    { label: 'Projects Bookmarked', value: userAnalytics?.projectsBookmarked || 0, icon: BookOpen },
    { label: 'Communities Joined', value: joinedPods.length, icon: Users }
  ];

  const analyticsStats = [
    { label: 'Profile Views', value: userAnalytics?.profileViews || 0, icon: Eye, change: '+0%' },
    { label: 'Projects Created', value: userAnalytics?.projectsCreated || 0, icon: MessageCircle, change: '+0%' },
    { label: 'Projects Applied', value: userAnalytics?.projectsApplied || 0, icon: Briefcase, change: '+0%' },
    { label: 'Projects Bookmarked', value: userAnalytics?.projectsBookmarked || 0, icon: BookOpen, change: '+0%' }
  ];

  // Helper function to get icon for activity type
  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'applied_to_project':
        return Briefcase;
      case 'created_project':
        return MessageCircle;
      case 'bookmarked_project':
        return BookOpen;
      case 'unbookmarked_project':
        return BookOpen;
      case 'joined_pod':
        return Users;
      case 'completed_project':
        return Award;
      default:
        return Activity;
    }
  };

  // Helper function to format activity time
  const formatActivityTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;

    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">

      <DashboardNavbar />

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="relative">
              <img
                src={userProfile?.photoURL || currentUser?.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face"}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-emerald-500/20"
              />
              <motion.button
                className="absolute bottom-0 right-0 p-2 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCameraClick}
                disabled={photoUploading}
              >
                {photoUploading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </motion.button>
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={photoInputRef}
                onChange={handlePhotoChange}
              />
            </div>

            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editedProfile.displayName}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, displayName: e.target.value }))}
                    className="text-2xl font-bold bg-transparent border-b-2 border-emerald-500 text-gray-900 dark:text-white focus:outline-none"
                    placeholder="Your Name"
                  />
                  <textarea
                    value={editedProfile.bio}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                    rows={3}
                    placeholder="Tell us about yourself..."
                  />
                  <input
                    type="text"
                    value={editedProfile.location}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="Location"
                  />
                  <div className="flex gap-3">
                    <motion.button
                      onClick={handleSaveProfile}
                      className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                    >
                      Save
                    </motion.button>
                    <motion.button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                    >
                      Cancel
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {userProfile?.displayName || currentUser?.displayName || 'Anonymous User'}
                    </h2>
                    <motion.button
                      onClick={() => setIsEditing(true)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Edit className="w-5 h-5 text-gray-500" />
                    </motion.button>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    {userProfile?.bio || 'No bio added yet. Click edit to add one!'}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{userProfile?.location || 'Location not set'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {userProfile?.joinDate ? new Date(userProfile.joinDate.seconds * 1000).toLocaleDateString() : 'Recently'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-8">
          <motion.button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'overview'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            whileHover={{ scale: 1.02 }}
          >
            Overview
          </motion.button>
          <motion.button
            onClick={() => setActiveTab('applications')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === 'applications'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            whileHover={{ scale: 1.02 }}
          >
            <Briefcase className="w-4 h-4" />
            Applications
          </motion.button>
          <motion.button
            onClick={() => setActiveTab('posted-projects')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === 'posted-projects'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            whileHover={{ scale: 1.02 }}
          >
            <BookOpen className="w-4 h-4" />
            Posted Projects
          </motion.button>
          <motion.button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === 'analytics'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            whileHover={{ scale: 1.02 }}
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </motion.button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {(activeTab === 'overview' ? stats : analyticsStats).map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
                {activeTab === 'analytics' && 'change' in stat && (
                  <div className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center justify-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {stat.change}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {activeTab === 'overview' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Joined Pods and Rooms */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-emerald-600" />
                Your Communities
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Pods Joined</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{joinedPods.length}</span>
                  </div>
                  {joinedPods.length > 0 ? (
                    <ul className="space-y-2">
                      {joinedPods.slice(0, 6).map((p) => (
                        <li key={p.id} className="text-sm text-gray-800 dark:text-gray-200 truncate">{p.name}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">You haven't joined any pods yet.</p>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Rooms Joined</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{joinedRooms.length}</span>
                  </div>
                  {joinedRooms.length > 0 ? (
                    <ul className="space-y-2">
                      {joinedRooms.slice(0, 6).map((r) => (
                        <li key={r.id} className="text-sm text-gray-800 dark:text-gray-200 truncate">{r.name}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">You haven't joined any rooms yet.</p>
                  )}
                </div>
              </div>
            </div>
            {/* Skills */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Code className="w-6 h-6 text-emerald-600" />
                  Skills
                </h3>
                <motion.button
                  className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                  onClick={() => {
                    setIsEditingSkills(true);
                    setSelectedSkills(userProfile?.skills || []);
                    setCustomSkillInput('');
                    setShowSkillsDropdown(false);
                  }}
                >
                  Edit
                </motion.button>
              </div>

              {isEditingSkills ? (
                <div className="space-y-4">
                  {/* Selected Skills */}
                  <div className="flex flex-wrap gap-2">
                    {selectedSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm flex items-center gap-1"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 ml-1"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Add New Skill */}
                  <div className="relative">
                    <input
                      type="text"
                      value={customSkillInput}
                      onChange={(e) => handleCustomSkillInput(e.target.value)}
                      onKeyPress={handleCustomSkillKeyPress}
                      className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      placeholder="Type to search or add a new skill..."
                    />

                    {/* Dropdown */}
                    {showSkillsDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredSkills.length > 0 ? (
                          filteredSkills.slice(0, 10).map((skill, index) => (
                            <div
                              key={index}
                              className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                              onClick={() => addSkill(skill)}
                            >
                              {skill}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
                            No matching skills found
                          </div>
                        )}
                        {customSkillInput.trim() && !predefinedSkills.includes(customSkillInput.trim()) && (
                          <div
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-emerald-600 dark:text-emerald-400 border-t border-gray-200 dark:border-gray-700"
                            onClick={() => addSkill(customSkillInput.trim())}
                          >
                            Add "{customSkillInput.trim()}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveSkills}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Save Skills
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingSkills(false);
                        setSelectedSkills(userProfile?.skills || []);
                        setCustomSkillInput('');
                        setShowSkillsDropdown(false);
                      }}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {userProfile?.skills && userProfile.skills.length > 0 ? (
                    userProfile.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No skills added yet</p>
                  )}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
                Recent Activity
              </h3>

              <div className="space-y-4">
                {activitiesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">Loading activities...</span>
                  </div>
                ) : activities.length > 0 ? (
                  activities.map((activity, index) => {
                    const Icon = getActivityIcon(activity.action);
                    return (
                      <motion.div
                        key={activity._id || index}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900 dark:text-white font-medium">
                            {activity.description}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatActivityTime(activity.timestamp)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                      Start by creating a project or applying to one!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === 'applications' ? (
          /* Applications Tab */
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-emerald-600" />
                My Applications
              </h3>
              <ApplicationsList />
            </div>
          </div>
        ) : activeTab === 'posted-projects' ? (
          /* Posted Projects Tab */
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-emerald-600" />
                Posted Projects
              </h3>
              <PostedProjectsList onProjectDeleted={fetchData} />
            </div>
          </div>
        ) : (
          /* Analytics Tab */
          <div className="space-y-8">
            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Activity Chart */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-emerald-600" />
                  Activity Overview
                </h3>

                <div className="space-y-4">
                  {[
                    { label: 'Profile Views', value: userAnalytics?.profileViews || 0, max: 200, color: 'bg-blue-500' },
                    { label: 'Projects Created', value: userAnalytics?.projectsCreated || 0, max: 20, color: 'bg-green-500' },
                    { label: 'Projects Applied', value: userAnalytics?.projectsApplied || 0, max: 100, color: 'bg-purple-500' },
                    { label: 'Projects Bookmarked', value: userAnalytics?.projectsBookmarked || 0, max: 10, color: 'bg-orange-500' }
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{item.value}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <motion.div
                          className={`h-2 rounded-full ${item.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((item.value / item.max) * 100, 100)}%` }}
                          transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Target className="w-6 h-6 text-emerald-600" />
                  Performance
                </h3>

                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                      {userProfile?.rating || 0}/5
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">Overall Rating</p>
                    <div className="flex justify-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= (userProfile?.rating || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {userProfile?.completedProjects || 0}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Projects</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {userProfile?.totalEarnings || '$0'}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Earned</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Analytics */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Detailed Analytics</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Eye className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics?.profileViews || 0}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Profile Views</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">+12% this week</p>
                </div>

                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics?.podsJoined || 0}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Communities</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">+2 this month</p>
                </div>

                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Briefcase className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userAnalytics?.projectsApplied || 0}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Applications</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">+15% this week</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
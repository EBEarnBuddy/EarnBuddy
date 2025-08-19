import { FirestoreService, Gig, ProjectRole } from './firestore';
import { serverTimestamp } from 'firebase/firestore';

// Sample permanent projects to seed the database
const permanentProjects: Omit<Gig, 'id' | 'createdAt' | 'updatedAt' | 'totalApplicants'>[] = [
  {
    title: "AI-Powered E-commerce Platform",
    description: "Building the next generation of e-commerce with AI-driven personalization, recommendation engines, and automated customer service. This platform will revolutionize how businesses interact with their customers online.",
    company: "TechVentures Inc.",
    industry: "ai",
    projectType: "startup",
    totalBudget: "$50,000 - $80,000",
    duration: "4-6 months",
    location: "San Francisco, CA",
    remote: true,
    equity: "2-5%",
    benefits: ["Health insurance", "Flexible hours", "Remote work", "Stock options"],
    roles: [
      {
        id: "ai-frontend-1",
        title: "Senior Frontend Developer",
        description: "Lead the development of our React-based frontend with TypeScript, focusing on performance optimization and user experience.",
        requirements: ["5+ years React experience", "TypeScript expertise", "Performance optimization skills"],
        responsibilities: ["Build responsive UI components", "Optimize application performance", "Mentor junior developers"],
        skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "GraphQL"],
        experience: "senior",
        budget: "$8,000 - $12,000/month",
        timeCommitment: "Full-time",
        applicants: [],
        filled: false,
        priority: "high"
      },
      {
        id: "ai-backend-1",
        title: "AI/ML Engineer",
        description: "Develop and implement machine learning models for product recommendations and customer behavior analysis.",
        requirements: ["3+ years ML experience", "Python expertise", "TensorFlow/PyTorch knowledge"],
        responsibilities: ["Build recommendation systems", "Implement ML pipelines", "Optimize model performance"],
        skills: ["Python", "TensorFlow", "PyTorch", "Scikit-learn", "AWS"],
        experience: "senior",
        budget: "$10,000 - $15,000/month",
        timeCommitment: "Full-time",
        applicants: [],
        filled: false,
        priority: "high"
      }
    ],
    status: "open",
    postedBy: "system",
    postedByName: "EarnBuddy Team",
    postedByAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    urgency: "high",
    featured: true,
    tags: ["AI", "E-commerce", "Machine Learning", "React", "Python"]
  },
  {
    title: "Sustainable Energy Management System",
    description: "Developing a comprehensive platform for monitoring and optimizing energy consumption in commercial buildings. The system will use IoT sensors and predictive analytics to reduce energy costs and carbon footprint.",
    company: "GreenTech Solutions",
    industry: "climate-tech",
    projectType: "enterprise",
    totalBudget: "$75,000 - $120,000",
    duration: "6-8 months",
    location: "Austin, TX",
    remote: true,
    equity: "1-3%",
    benefits: ["Health insurance", "401k matching", "Professional development", "Green initiatives"],
    roles: [
      {
        id: "energy-iot-1",
        title: "IoT Engineer",
        description: "Design and implement IoT sensor networks for energy monitoring and data collection.",
        requirements: ["IoT development experience", "Embedded systems knowledge", "Wireless protocols expertise"],
        responsibilities: ["Design sensor networks", "Implement data collection", "Ensure system reliability"],
        skills: ["Arduino", "Raspberry Pi", "MQTT", "LoRaWAN", "Python"],
        experience: "mid",
        budget: "$6,000 - $9,000/month",
        timeCommitment: "Full-time",
        applicants: [],
        filled: false,
        priority: "medium"
      },
      {
        id: "energy-data-1",
        title: "Data Scientist",
        description: "Analyze energy consumption patterns and develop predictive models for optimization.",
        requirements: ["Data science background", "Statistical analysis skills", "Energy domain knowledge"],
        responsibilities: ["Analyze consumption data", "Build predictive models", "Create optimization algorithms"],
        skills: ["Python", "R", "SQL", "Tableau", "Machine Learning"],
        experience: "senior",
        budget: "$8,000 - $12,000/month",
        timeCommitment: "Full-time",
        applicants: [],
        filled: false,
        priority: "high"
      }
    ],
    status: "open",
    postedBy: "system",
    postedByName: "EarnBuddy Team",
    postedByAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    urgency: "medium",
    featured: true,
    tags: ["IoT", "Energy", "Sustainability", "Data Science", "Predictive Analytics"]
  },
  {
    title: "FinTech Mobile Banking App",
    description: "Creating a modern mobile banking application with advanced security features, real-time transactions, and AI-powered financial insights. The app will serve both individual and business customers.",
    company: "DigitalBank Pro",
    industry: "fintech",
    projectType: "startup",
    totalBudget: "$60,000 - $90,000",
    duration: "5-7 months",
    location: "New York, NY",
    remote: true,
    equity: "3-6%",
    benefits: ["Health insurance", "Stock options", "Flexible PTO", "Learning budget"],
    roles: [
      {
        id: "fintech-mobile-1",
        title: "Mobile App Developer (React Native)",
        description: "Build cross-platform mobile applications for iOS and Android with focus on performance and security.",
        requirements: ["3+ years React Native", "Mobile security knowledge", "App Store experience"],
        responsibilities: ["Develop mobile features", "Implement security measures", "Optimize app performance"],
        skills: ["React Native", "TypeScript", "Redux", "Firebase", "App Security"],
        experience: "mid",
        budget: "$7,000 - $10,000/month",
        timeCommitment: "Full-time",
        applicants: [],
        filled: false,
        priority: "high"
      },
      {
        id: "fintech-backend-1",
        title: "Backend Developer (Node.js)",
        description: "Develop secure and scalable backend services for the banking application with real-time transaction processing.",
        requirements: ["Node.js expertise", "Database design skills", "Security best practices"],
        responsibilities: ["Build API services", "Implement security", "Database optimization"],
        skills: ["Node.js", "Express", "PostgreSQL", "Redis", "JWT"],
        experience: "senior",
        budget: "$8,000 - $12,000/month",
        timeCommitment: "Full-time",
        applicants: [],
        filled: false,
        priority: "high"
      }
    ],
    status: "open",
    postedBy: "system",
    postedByName: "EarnBuddy Team",
    postedByAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    urgency: "high",
    featured: true,
    tags: ["FinTech", "Mobile", "Banking", "Security", "React Native"]
  },
  {
    title: "Healthcare Telemedicine Platform",
    description: "Building a comprehensive telemedicine platform that connects patients with healthcare providers through video consultations, appointment scheduling, and digital health records management.",
    company: "HealthConnect",
    industry: "healthcare",
    projectType: "enterprise",
    totalBudget: "$80,000 - $130,000",
    duration: "7-9 months",
    location: "Boston, MA",
    remote: true,
    equity: "1-2%",
    benefits: ["Health insurance", "Dental coverage", "Professional development", "Work-life balance"],
    roles: [
      {
        id: "health-frontend-1",
        title: "Frontend Developer (Vue.js)",
        description: "Create intuitive user interfaces for patients and healthcare providers with focus on accessibility and usability.",
        requirements: ["Vue.js experience", "Accessibility knowledge", "Healthcare domain understanding"],
        responsibilities: ["Build patient portals", "Implement accessibility", "Create provider dashboards"],
        skills: ["Vue.js", "Vuex", "SCSS", "Accessibility", "Healthcare APIs"],
        experience: "mid",
        budget: "$6,000 - $9,000/month",
        timeCommitment: "Full-time",
        applicants: [],
        filled: false,
        priority: "medium"
      },
      {
        id: "health-security-1",
        title: "Security Engineer",
        description: "Implement HIPAA-compliant security measures and ensure data protection for sensitive medical information.",
        requirements: ["Security expertise", "HIPAA knowledge", "Compliance experience"],
        responsibilities: ["Implement security protocols", "Ensure HIPAA compliance", "Conduct security audits"],
        skills: ["Security", "HIPAA", "Encryption", "Compliance", "Audit"],
        experience: "senior",
        budget: "$9,000 - $13,000/month",
        timeCommitment: "Full-time",
        applicants: [],
        filled: false,
        priority: "high"
      }
    ],
    status: "open",
    postedBy: "system",
    postedByName: "EarnBuddy Team",
    postedByAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    urgency: "medium",
    featured: false,
    tags: ["Healthcare", "Telemedicine", "HIPAA", "Vue.js", "Security"]
  },
  {
    title: "Social Impact Non-Profit Website",
    description: "Creating a modern, accessible website for a non-profit organization focused on education and community development. The platform will include donation systems, volunteer management, and impact tracking.",
    company: "CommunityBuilders",
    industry: "e-commerce",
    projectType: "nonprofit",
    totalBudget: "$25,000 - $40,000",
    duration: "3-4 months",
    location: "Remote",
    remote: true,
    equity: "0%",
    benefits: ["Flexible hours", "Remote work", "Social impact", "Professional growth"],
    roles: [
      {
        id: "nonprofit-fullstack-1",
        title: "Full-Stack Developer",
        description: "Build a complete website with donation processing, volunteer management, and content management systems.",
        requirements: ["Full-stack development", "Payment processing", "CMS experience"],
        responsibilities: ["Develop website features", "Integrate payment systems", "Create admin panels"],
        skills: ["React", "Node.js", "Stripe", "MongoDB", "WordPress"],
        experience: "mid",
        budget: "$4,000 - $6,000/month",
        timeCommitment: "Part-time",
        applicants: [],
        filled: false,
        priority: "low"
      },
      {
        id: "nonprofit-design-1",
        title: "UI/UX Designer",
        description: "Design accessible and engaging user interfaces that effectively communicate the organization's mission and impact.",
        requirements: ["UI/UX design skills", "Accessibility knowledge", "Non-profit experience"],
        responsibilities: ["Design user interfaces", "Create brand guidelines", "Ensure accessibility"],
        skills: ["Figma", "Adobe Creative Suite", "Accessibility", "User Research", "Prototyping"],
        experience: "entry",
        budget: "$3,000 - $5,000/month",
        timeCommitment: "Part-time",
        applicants: [],
        filled: false,
        priority: "low"
      }
    ],
    status: "open",
    postedBy: "system",
    postedByName: "EarnBuddy Team",
    postedByAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    urgency: "low",
    featured: false,
    tags: ["Non-Profit", "Social Impact", "Web Design", "Donations", "Volunteer Management"]
  }
];

// Function to seed the database with permanent projects
export const seedPermanentProjects = async () => {
  try {
    console.log('Starting to seed permanent projects...');

    // Check if projects already exist to avoid duplicates
    const existingProjects = await FirestoreService.getProjects();
    const existingTitles = existingProjects.map(p => p.title);

    let createdCount = 0;

    for (const project of permanentProjects) {
      // Skip if project with same title already exists
      if (existingTitles.includes(project.title)) {
        console.log(`Project "${project.title}" already exists, skipping...`);
        continue;
      }

      try {
        const projectId = await FirestoreService.createProject(project);
        console.log(`✅ Created project: ${project.title} (ID: ${projectId})`);
        createdCount++;
      } catch (error) {
        console.error(`❌ Failed to create project "${project.title}":`, error);
      }
    }

    console.log(`🎉 Seeding complete! Created ${createdCount} new projects.`);
    return createdCount;
  } catch (error) {
    console.error('❌ Error seeding projects:', error);
    throw error;
  }
};

// Function to check if seeding is needed
export const checkAndSeedProjects = async () => {
  try {
    const existingProjects = await FirestoreService.getProjects();

    // If no projects exist, seed the database
    if (existingProjects.length === 0) {
      console.log('No projects found in database. Seeding permanent projects...');
      await seedPermanentProjects();
    } else {
      console.log(`Found ${existingProjects.length} existing projects.`);
    }
  } catch (error) {
    console.error('Error checking/seeding projects:', error);
  }
};

// Export the permanent projects for reference
export { permanentProjects };
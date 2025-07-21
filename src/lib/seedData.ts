import { FirestoreService } from './firestore';
import { Timestamp, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export const seedSampleData = async () => {
  try {
    console.log('Starting to seed sample data...');

    // Sample Pods
    const pods = [
      {
        name: 'AI Builders',
        slug: 'ai-builders',
        description: 'Building the future with artificial intelligence and machine learning',
        theme: 'from-blue-500 to-purple-600',
        icon: 'Cpu',
        members: [],
        posts: [],
        events: [
          {
            title: 'AI Hackathon 2025',
            date: '2025-02-15',
            description: 'Build AI solutions for real-world problems'
          }
        ],
        pinnedResources: [
          {
            title: 'TensorFlow Documentation',
            url: 'https://tensorflow.org',
            type: 'documentation'
          },
          {
            title: 'AI Research Papers',
            url: 'https://arxiv.org',
            type: 'research'
          }
        ],
        isActive: true,
        postCount: 0,
        lastActivity: null
      },
      {
        name: 'Web3 Pioneers',
        slug: 'web3-pioneers',
        description: 'Decentralizing the internet, one dApp at a time',
        theme: 'from-purple-500 to-pink-600',
        icon: 'Globe',
        members: [],
        posts: [],
        events: [
          {
            title: 'DeFi Demo Day',
            date: '2025-02-20',
            description: 'Showcase your DeFi projects'
          }
        ],
        pinnedResources: [
          {
            title: 'Ethereum Documentation',
            url: 'https://ethereum.org',
            type: 'documentation'
          },
          {
            title: 'Solidity by Example',
            url: 'https://solidity-by-example.org',
            type: 'tutorial'
          }
        ],
        isActive: true,
        postCount: 0,
        lastActivity: null
      },
      {
        name: 'Climate Tech',
        slug: 'climate-tech',
        description: 'Solving climate change through innovative technology solutions',
        theme: 'from-green-500 to-emerald-600',
        icon: 'Leaf',
        members: [],
        posts: [],
        events: [
          {
            title: 'Climate Solutions Summit',
            date: '2025-03-01',
            description: 'Collaborate on climate tech innovations'
          }
        ],
        pinnedResources: [
          {
            title: 'Climate Tech Handbook',
            url: 'https://climatetech.org',
            type: 'guide'
          }
        ],
        isActive: true,
        postCount: 0,
        lastActivity: null
      },
      {
        name: 'Design Systems',
        slug: 'design-systems',
        description: 'Creating beautiful, functional, and scalable design experiences',
        theme: 'from-pink-500 to-red-600',
        icon: 'Palette',
        members: [],
        posts: [],
        events: [],
        pinnedResources: [
          {
            title: 'Design System Checklist',
            url: 'https://designsystemchecklist.com',
            type: 'tool'
          }
        ],
        isActive: true,
        postCount: 0,
        lastActivity: null
      },
      {
        name: 'FinTech Innovators',
        slug: 'fintech-innovators',
        description: 'Revolutionizing financial services and payment systems',
        theme: 'from-yellow-500 to-orange-600',
        icon: 'DollarSign',
        members: [],
        posts: [],
        events: [],
        pinnedResources: [],
        isActive: true,
        postCount: 0,
        lastActivity: null
      }
    ];

    // Create pods
    const createdPods = [];
    for (const pod of pods) {
      const podId = await FirestoreService.createPod(pod);
      createdPods.push({ id: podId, ...pod });
      console.log(`Created pod: ${pod.name}`);
    }

    // Sample Freelance Gigs
    const gigs = [
      {
        title: 'Frontend Developer for E-commerce Platform',
        description: 'We\'re looking for a skilled frontend developer to help build our next-generation e-commerce platform using React and TypeScript.',
        tags: ['React', 'TypeScript', 'Tailwind CSS'],
        budget: '$2,500 - $4,000',
        duration: '2-3 weeks',
        postedBy: 'sample-user-1',
        applicants: [],
        status: 'open' as const,
        requirements: ['3+ years React experience', 'TypeScript proficiency', 'E-commerce experience preferred']
      },
      {
        title: 'UI/UX Designer for Mobile App',
        description: 'Seeking a creative UI/UX designer to design a modern mobile application for our fitness platform.',
        tags: ['Figma', 'Mobile Design', 'Prototyping'],
        budget: '$1,800 - $3,200',
        duration: '3-4 weeks',
        postedBy: 'sample-user-2',
        applicants: [],
        status: 'open' as const,
        requirements: ['Mobile design experience', 'Figma expertise', 'User research skills']
      },
      {
        title: 'Full-stack Developer for SaaS Platform',
        description: 'Build a comprehensive SaaS platform with modern technologies including React, Node.js, and PostgreSQL.',
        tags: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
        budget: '$5,000 - $8,000',
        duration: '6-8 weeks',
        postedBy: 'sample-user-3',
        applicants: [],
        status: 'open' as const,
        requirements: ['Full-stack experience', 'Database design', 'Cloud deployment']
      }
    ];

    // Create gigs
    for (const gig of gigs) {
      await FirestoreService.createGig(gig);
      console.log(`Created gig: ${gig.title}`);
    }

    // Sample Startups
    const startups = [
      {
        name: 'HealthTech Innovations',
        description: 'AI-powered healthcare assistant that helps doctors make better diagnoses using machine learning algorithms.',
        industry: 'Healthcare',
        stage: 'Seed Stage',
        location: 'San Francisco, CA',
        createdBy: 'sample-user-1',
        applicants: [],
        status: 'active' as const,
        funding: '$500K raised',
        equity: '2-5%',
        requirements: ['React', 'Node.js', 'AI/ML', 'Healthcare Experience']
      },
      {
        name: 'EcoWear',
        description: 'Sustainable fashion marketplace connecting eco-conscious brands with consumers who care about the planet.',
        industry: 'Fashion',
        stage: 'Pre-Seed',
        location: 'New York, NY',
        createdBy: 'sample-user-2',
        applicants: [],
        status: 'active' as const,
        funding: 'Seeking $250K',
        equity: '5-10%',
        requirements: ['E-commerce', 'Sustainability', 'Marketing', 'Fashion Industry']
      },
      {
        name: 'LearnSphere',
        description: 'EdTech platform transforming online education with personalized learning experiences powered by advanced analytics.',
        industry: 'Education',
        stage: 'Series A',
        location: 'Austin, TX',
        createdBy: 'sample-user-3',
        applicants: [],
        status: 'active' as const,
        funding: '$2M raised',
        equity: '1-3%',
        requirements: ['EdTech', 'React', 'Data Analytics', 'Education']
      }
    ];

    // Create startups
    for (const startup of startups) {
      await FirestoreService.createStartup(startup);
      console.log(`Created startup: ${startup.name}`);
    }

    // Sample Posts for AI Builders pod
    if (createdPods.length > 0) {
      const aiPodId = createdPods[0].id;
      const samplePosts = [
        {
          podId: aiPodId,
          userId: 'sample-user-1',
          userName: 'Sarah Chen',
          userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face',
          content: 'Just launched our new computer vision model! Achieved 94% accuracy on the benchmark dataset. The breakthrough came from combining transformer architectures with novel attention mechanisms. Open sourcing it next week - excited to see what the community builds with it!',
          imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500&h=300&fit=crop',
          likes: [],
          comments: [],
          bookmarks: []
        },
        {
          podId: aiPodId,
          userId: 'sample-user-2',
          userName: 'Marcus Rodriguez',
          userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
          content: 'Looking for collaborators on a new NLP project focused on sentiment analysis for financial markets. We\'re exploring real-time processing of news feeds and social media to predict market movements. DM me if you have experience with transformers or financial data!',
          likes: [],
          comments: [],
          bookmarks: []
        },
        {
          podId: aiPodId,
          userId: 'sample-user-3',
          userName: 'Alex Kim',
          userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
          content: 'Great article on transformer architectures and their applications in computer vision. The attention mechanism explanation is particularly clear and well-illustrated. Highly recommend for anyone getting started with vision transformers.',
          likes: [],
          comments: [],
          bookmarks: []
        }
      ];

      for (const post of samplePosts) {
        await addDoc(collection(db, 'podPosts'), {
          ...post,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        console.log(`Created post in AI Builders pod`);
      }
    }

    // Sample Rooms
    const rooms = [
      {
        name: 'React Developers',
        description: 'Collaborate on React projects, share code, and discuss best practices',
        members: ['sample-user-1'],
        createdBy: 'sample-user-1',
        isPrivate: false,
        category: 'Development',
        avatar: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=100&h=100&fit=crop',
        hasWhiteboard: true,
        hasVideoCall: true
      },
      {
        name: 'AI/ML Research Hub',
        description: 'Discuss latest AI research, share models, and collaborate on ML projects',
        members: ['sample-user-2'],
        createdBy: 'sample-user-2',
        isPrivate: false,
        category: 'AI/ML',
        avatar: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=100&h=100&fit=crop',
        hasWhiteboard: true,
        hasVideoCall: true
      },
      {
        name: 'Startup Founders Lounge',
        description: 'Connect with fellow founders, share experiences, and get advice',
        members: ['sample-user-3'],
        createdBy: 'sample-user-3',
        isPrivate: false,
        category: 'Startup',
        avatar: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=100&h=100&fit=crop',
        hasWhiteboard: true,
        hasVideoCall: true
      },
      {
        name: 'Design Critique Studio',
        description: 'Share your designs, get feedback, and collaborate on creative projects',
        members: ['sample-user-1', 'sample-user-2'],
        createdBy: 'sample-user-1',
        isPrivate: false,
        category: 'Design',
        avatar: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=100&h=100&fit=crop',
        hasWhiteboard: true,
        hasVideoCall: true
      },
      {
        name: 'Product Strategy Room',
        description: 'Discuss product roadmaps, user research, and growth strategies',
        members: ['sample-user-2', 'sample-user-3'],
        createdBy: 'sample-user-2',
        isPrivate: false,
        category: 'Product',
        avatar: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100&h=100&fit=crop',
        hasWhiteboard: true,
        hasVideoCall: true
      },
      {
        name: 'DevOps & Infrastructure',
        description: 'Share knowledge about deployment, scaling, and infrastructure management',
        members: ['sample-user-1', 'sample-user-3'],
        createdBy: 'sample-user-1',
        isPrivate: false,
        category: 'DevOps',
        avatar: 'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=100&h=100&fit=crop',
        hasWhiteboard: true,
        hasVideoCall: true
      },
      {
        name: 'Mobile Development',
        description: 'iOS, Android, and cross-platform mobile development discussions',
        members: ['sample-user-2'],
        createdBy: 'sample-user-2',
        isPrivate: false,
        category: 'Mobile',
        avatar: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=100&h=100&fit=crop',
        hasWhiteboard: true,
        hasVideoCall: true
      },
      {
        name: 'Blockchain Builders',
        description: 'Build the future of decentralized applications and smart contracts',
        members: ['sample-user-1', 'sample-user-2', 'sample-user-3'],
        createdBy: 'sample-user-3',
        isPrivate: false,
        category: 'Blockchain',
        avatar: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=100&h=100&fit=crop',
        hasWhiteboard: true,
        hasVideoCall: true
      },
      {
        name: 'Data Science Lab',
        description: 'Analyze data, build models, and share insights with fellow data scientists',
        members: ['sample-user-2', 'sample-user-3'],
        createdBy: 'sample-user-2',
        isPrivate: false,
        category: 'Data Science',
        avatar: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop',
        hasWhiteboard: true,
        hasVideoCall: true
      },
      {
        name: 'Cybersecurity Hub',
        description: 'Discuss security best practices, vulnerabilities, and protection strategies',
        members: ['sample-user-1'],
        createdBy: 'sample-user-1',
        isPrivate: false,
        category: 'Security',
        avatar: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=100&h=100&fit=crop',
        hasWhiteboard: true,
        hasVideoCall: true
      }
    ];

    // Create rooms
    const createdRooms = [];
    for (const room of rooms) {
      const roomId = await FirestoreService.createRoom(room);
      createdRooms.push({ id: roomId, ...room });
      console.log(`Created room: ${room.name}`);
    }

    // Add sample messages to each room
    for (const room of createdRooms) {
      const sampleMessages = [
        {
          roomId: room.id,
          senderId: 'sample-user-1',
          senderName: 'Sarah Chen',
          senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face',
          content: `Welcome to ${room.name}! Let's start collaborating 🚀`,
          type: 'text' as const,
          reactions: {}
        },
        {
          roomId: room.id,
          senderId: 'sample-user-2',
          senderName: 'Marcus Rodriguez',
          senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
          content: 'Great to be here! Looking forward to working together.',
          type: 'text' as const,
          reactions: {}
        },
        {
          roomId: room.id,
          senderId: 'sample-user-3',
          senderName: 'Alex Kim',
          senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
          content: `This ${room.category} room is exactly what I was looking for! 💪`,
          type: 'text' as const,
          reactions: { '👍': ['sample-user-1'], '🔥': ['sample-user-2'] }
        }
      ];
      
      for (const message of sampleMessages) {
        await FirestoreService.sendChatMessage(message);
      }
    }

    console.log('Sample data seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding sample data:', error);
    throw error;
  }
};
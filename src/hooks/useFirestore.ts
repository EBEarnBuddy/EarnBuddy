import { useState, useEffect } from 'react';
import { FirestoreService, Pod, PodPost, Room, Message, Startup, FreelanceGig, Notification, ChatMessage } from '../lib/firestore';
import { useAuth } from '../contexts/AuthContext';

// Custom hooks for Firestore operations
export const usePods = () => {
  const [pods, setPods] = useState<Pod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPods = async () => {
      try {
        setLoading(true);
        const fetchedPods = await FirestoreService.getPods();
        setPods(fetchedPods);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch pods');
      } finally {
        setLoading(false);
      }
    };

    fetchPods();
  }, []);

  const joinPod = async (podId: string, userId: string) => {
    try {
      await FirestoreService.joinPod(podId, userId);
      // Refresh pods
      const updatedPods = await FirestoreService.getPods();
      setPods(updatedPods);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join pod');
    }
  };

  const leavePod = async (podId: string, userId: string) => {
    try {
      await FirestoreService.leavePod(podId, userId);
      // Refresh pods
      const updatedPods = await FirestoreService.getPods();
      setPods(updatedPods);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave pod');
    }
  };

  const createPod = async (podData: Omit<Pod, 'id' | 'createdAt' | 'memberCount'>) => {
    try {
      const podId = await FirestoreService.createPod(podData);
      // Refresh pods
      const fetchedPods = await FirestoreService.getPods();
      setPods(fetchedPods);
      return podId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create pod');
      throw err;
    }
  };

  return { pods, loading, error, joinPod, leavePod, createPod };
};

export const usePodPosts = (podId: string) => {
  const [posts, setPosts] = useState<PodPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!podId) return;

    const fetchPosts = async () => {
      try {
        setLoading(true);
        const fetchedPosts = await FirestoreService.getPodPosts(podId);
        setPosts(fetchedPosts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [podId]);

  const createPost = async (content: string, userId: string, imageUrl?: string) => {
    try {
      await FirestoreService.createPodPost(podId, userId, content, imageUrl);
      // Refresh posts
      const updatedPosts = await FirestoreService.getPodPosts(podId);
      setPosts(updatedPosts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    }
  };

  const likePost = async (postId: string, userId: string) => {
    try {
      await FirestoreService.likePost(postId, userId);
      // Refresh posts
      const updatedPosts = await FirestoreService.getPodPosts(podId);
      setPosts(updatedPosts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to like post');
    }
  };

  const unlikePost = async (postId: string, userId: string) => {
    try {
      await FirestoreService.unlikePost(postId, userId);
      // Refresh posts
      const updatedPosts = await FirestoreService.getPodPosts(podId);
      setPosts(updatedPosts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlike post');
    }
  };

  const bookmarkPost = async (postId: string, userId: string) => {
    try {
      await FirestoreService.bookmarkPost(postId, userId);
      // Refresh posts
      const updatedPosts = await FirestoreService.getPodPosts(podId);
      setPosts(updatedPosts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bookmark post');
    }
  };

  return { posts, loading, error, createPost, likePost, unlikePost, bookmarkPost };
};

export const useRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const fetchRooms = async () => {
      try {
        setLoading(true);
        const fetchedRooms = await FirestoreService.getRooms(currentUser.uid);
        setRooms(fetchedRooms);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch rooms');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [currentUser]);

  const createRoom = async (roomData: Omit<Room, 'id' | 'createdAt' | 'lastActivity'>) => {
    try {
      await FirestoreService.createRoom(roomData);
      // Refresh rooms
      if (currentUser) {
        const updatedRooms = await FirestoreService.getRooms(currentUser.uid);
        setRooms(updatedRooms);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
    }
  };

  const joinRoom = async (roomId: string) => {
    try {
      if (!currentUser) return;
      await FirestoreService.joinRoom(roomId, currentUser.uid);
      // Refresh rooms
      const updatedRooms = await FirestoreService.getRooms(currentUser.uid);
      setRooms(updatedRooms);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join room');
    }
  };

  return { rooms, loading, error, createRoom, joinRoom };
};

export const useRoomMessages = (roomId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) return;

    setLoading(true);

    // Set up real-time listener
    const unsubscribe = FirestoreService.subscribeToRoomMessages(roomId, (newMessages) => {
      setMessages(newMessages);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [roomId]);

  const sendMessage = async (content: string, senderId: string, type: 'text' | 'image' | 'file' | 'video' = 'text', attachment?: any) => {
    try {
      await FirestoreService.sendMessage({
        roomId,
        senderId,
        content,
        type,
        attachment
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  return { messages, loading, error, sendMessage };
};

export const useRoomChatMessages = (roomId: string) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) return;

    setLoading(true);

    // Set up real-time listener
    const unsubscribe = FirestoreService.subscribeToRoomMessages(roomId, (newMessages) => {
      setMessages(newMessages);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [roomId]);

  const sendMessage = async (content: string, senderId: string, senderName: string, senderAvatar: string, type: 'text' | 'image' | 'file' | 'video' = 'text', attachment?: any) => {
    try {
      await FirestoreService.sendChatMessage({
        roomId,
        senderId,
        senderName,
        senderAvatar,
        content,
        type,
        attachment,
        reactions: {}
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  const addReaction = async (messageId: string, emoji: string, userId: string) => {
    try {
      await FirestoreService.addReactionToChatMessage(messageId, emoji, userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add reaction');
    }
  };

  return { messages, loading, error, sendMessage, addReaction };
};

export const useStartups = () => {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStartups = async () => {
      try {
        setLoading(true);
        const fetchedStartups = await FirestoreService.getStartups();
        setStartups(fetchedStartups);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch startups');
      } finally {
        setLoading(false);
      }
    };

    fetchStartups();
  }, []);

  const createStartup = async (startupData: Omit<Startup, 'id' | 'createdAt' | 'updatedAt' | 'applicantCount'>) => {
    try {
      await FirestoreService.createStartup(startupData);
      // Refresh startups
      const updatedStartups = await FirestoreService.getStartups();
      setStartups(updatedStartups);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create startup');
    }
  };

  const applyToStartup = async (startupId: string, userId: string, applicationData?: { coverLetter?: string; portfolio?: string }) => {
    try {
      await FirestoreService.applyToStartup(startupId, userId, applicationData);
      // Refresh startups
      const updatedStartups = await FirestoreService.getStartups();
      setStartups(updatedStartups);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply to startup');
    }
  };

  const bookmarkStartup = async (startupId: string, userId: string) => {
    try {
      await FirestoreService.bookmarkStartup(startupId, userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bookmark startup');
    }
  };

  const unbookmarkStartup = async (startupId: string, userId: string) => {
    try {
      await FirestoreService.unbookmarkStartup(startupId, userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unbookmark startup');
    }
  };

  return { startups, loading, error, createStartup, applyToStartup, bookmarkStartup, unbookmarkStartup };
};

export const useProjects = () => {
  const [projects, setProjects] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const fetchedProjects = await FirestoreService.getProjects();
        setProjects(fetchedProjects);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const createProject = async (projectData: Omit<Gig, 'id' | 'createdAt' | 'updatedAt' | 'totalApplicants'>) => {
    try {
      await FirestoreService.createProject(projectData);
      // Refresh projects
      const updatedProjects = await FirestoreService.getProjects();
      setProjects(updatedProjects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    }
  };

  const applyToRole = async (projectId: string, roleId: string, userId: string, applicationData: {
    coverLetter: string;
    portfolio?: string;
    expectedSalary?: string;
    availability: string;
  }) => {
    try {
      await FirestoreService.applyToRole(projectId, roleId, userId, applicationData);
      // Refresh projects
      const updatedProjects = await FirestoreService.getProjects();
      setProjects(updatedProjects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply to role');
    }
  };

  const bookmarkProject = async (projectId: string, userId: string) => {
    try {
      await FirestoreService.bookmarkProject(projectId, userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bookmark project');
    }
  };

  const unbookmarkProject = async (projectId: string, userId: string) => {
    try {
      await FirestoreService.unbookmarkProject(projectId, userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unbookmark project');
    }
  };

  return { projects, loading, error, createProject, applyToRole, bookmarkProject, unbookmarkProject };
};

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);

    // Set up real-time listener
    const unsubscribe = FirestoreService.subscribeToUserNotifications(currentUser.uid, (newNotifications) => {
      setNotifications(newNotifications);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const markAsRead = async (notificationId: string) => {
    try {
      await FirestoreService.markNotificationAsRead(notificationId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
    }
  };

  const unreadCount = notifications.filter(n => !n.seen).length;

  return { notifications, loading, error, markAsRead, unreadCount };
};

// Enhanced Pod Posts Hook
export const useEnhancedPodPosts = (podId: string) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!podId) return;

    setLoading(true);

    // Set up real-time listener for pod posts
    try {
      const unsubscribe = FirestoreService.subscribeToPodPosts(podId, (newPosts) => {
        setPosts(newPosts);
        setLoading(false);
        setError(null);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('Error subscribing to pod posts:', err);
      setError('Unable to load posts. Please try again later.');
      setLoading(false);
    }
  }, [podId]);

  const createPost = async (content: string, userId: string, imageUrl?: string) => {
    try {
      await FirestoreService.createPodPost(podId, userId, content, imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    }
  };

  return { posts, loading, error, createPost };
};

// Onboarding Hook
export const useOnboarding = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const saveOnboardingResponse = async (data: {
    role: string;
    skills: string[];
    interests: string[];
    experience: string;
    location: string;
    goals: string[];
    availability: string;
  }) => {
    if (!currentUser) return;

    try {
      setLoading(true);
      await FirestoreService.saveOnboardingResponse({
        userId: currentUser.uid,
        ...data
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save onboarding data');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getOnboardingResponse = async (userId: string): Promise<any | null> => {
    try {
      return await FirestoreService.getOnboardingResponse(userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get onboarding data');
      return null;
    }
  };

  return { saveOnboardingResponse, getOnboardingResponse, loading, error };
};

// Analytics Hook
export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        // TODO: Implement real analytics data fetching
        setAnalytics(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [currentUser]);

  return { analytics, loading, error };
};

// Recommendations Hook
export const useRecommendations = () => {
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const data = await FirestoreService.getPersonalizedRecommendations(currentUser.uid);
        setRecommendations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [currentUser]);

  return { recommendations, loading, error };
};
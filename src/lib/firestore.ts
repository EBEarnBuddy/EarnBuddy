import { 
  collection, 
  doc, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  arrayUnion, 
  arrayRemove, 
  increment,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Data Types
export interface Pod {
  id?: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  members: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isPrivate: boolean;
  tags: string[];
  avatar?: string;
  createdBy: string;
}

export interface PodPost {
  id?: string;
  podId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  type: 'text' | 'image' | 'link' | 'poll';
  attachments?: any[];
  likes: string[];
  comments: Comment[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: Timestamp;
  likes: string[];
}

export interface Gig {
  id?: string;
  title: string;
  description: string;
  budget: string;
  duration: string;
  skills: string[];
  category: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  applicants: GigApplication[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  location?: string;
  remote: boolean;
  urgency: 'low' | 'medium' | 'high';
}

export interface GigApplication {
  userId: string;
  userName: string;
  userAvatar?: string;
  coverLetter: string;
  proposedBudget?: string;
  proposedTimeline?: string;
  portfolio?: string;
  appliedAt: Timestamp;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Startup {
  id?: string;
  name: string;
  description: string;
  industry: string;
  stage: string;
  location: string;
  funding: string;
  equity: string;
  requirements: string[];
  founderId: string;
  founderName: string;
  founderAvatar?: string;
  status: 'active' | 'paused' | 'closed';
  applicants: StartupApplication[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  website?: string;
  logo?: string;
  teamSize?: number;
}

export interface StartupApplication {
  userId: string;
  userName: string;
  userAvatar?: string;
  coverLetter: string;
  portfolio?: string;
  appliedAt: Timestamp;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface ChatRoom {
  id?: string;
  name: string;
  description: string;
  category: string;
  members: string[];
  createdBy: string;
  createdAt: Timestamp;
  lastActivity: Timestamp;
  isPrivate: boolean;
  avatar?: string;
}

export interface ChatMessage {
  id?: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'file';
  attachment?: {
    url: string;
    name: string;
    type: string;
    size: string;
  };
  reactions: { [emoji: string]: string[] };
  timestamp: Timestamp;
  edited?: boolean;
  editedAt?: Timestamp;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  skills: string[];
  interests: string[];
  location?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  onboardingCompleted: boolean;
  onboardingData?: OnboardingData;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface OnboardingData {
  role: 'freelancer' | 'founder' | 'builder' | 'investor';
  experience: 'beginner' | 'intermediate' | 'expert';
  interests: string[];
  skills: string[];
  goals: string[];
  availability: 'full-time' | 'part-time' | 'weekends' | 'flexible';
  budget?: string;
  location?: string;
  remote: boolean;
}

export interface UserAnalytics {
  userId: string;
  profileViews: number;
  postsCreated: number;
  messagesPosted: number;
  podsJoined: number;
  gigsApplied: number;
  startupsApplied: number;
  completedProjects: number;
  earnings: number;
  lastActive: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Recommendation {
  userId: string;
  recommendedGigs: Gig[];
  recommendedStartups: Startup[];
  recommendedPods: Pod[];
  recommendedUsers: UserProfile[];
  lastUpdated: Timestamp;
}

// Firestore Service Class
export class FirestoreService {
  // Pods
  static async createPod(podData: Omit<Pod, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'pods'), {
      ...podData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  }

  static async getPods(): Promise<Pod[]> {
    const querySnapshot = await getDocs(
      query(collection(db, 'pods'), orderBy('updatedAt', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pod));
  }

  static async joinPod(podId: string, userId: string): Promise<void> {
    const podRef = doc(db, 'pods', podId);
    await updateDoc(podRef, {
      members: arrayUnion(userId),
      memberCount: increment(1),
      updatedAt: serverTimestamp()
    });
  }

  static async leavePod(podId: string, userId: string): Promise<void> {
    const podRef = doc(db, 'pods', podId);
    await updateDoc(podRef, {
      members: arrayRemove(userId),
      memberCount: increment(-1),
      updatedAt: serverTimestamp()
    });
  }

  // Pod Posts
  static async createPodPost(postData: Omit<PodPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'podPosts'), {
      ...postData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  }

  static async getPodPosts(podId: string): Promise<PodPost[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, 'podPosts'),
        where('podId', '==', podId),
        orderBy('createdAt', 'desc')
      )
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PodPost));
  }

  static async likePodPost(postId: string, userId: string): Promise<void> {
    const postRef = doc(db, 'podPosts', postId);
    await updateDoc(postRef, {
      likes: arrayUnion(userId),
      updatedAt: serverTimestamp()
    });
  }

  // Gigs
  static async createGig(gigData: Omit<Gig, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'gigs'), {
      ...gigData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  }

  static async getGigs(): Promise<Gig[]> {
    const querySnapshot = await getDocs(
      query(collection(db, 'gigs'), orderBy('createdAt', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Gig));
  }

  static async applyToGig(gigId: string, application: Omit<GigApplication, 'appliedAt' | 'status'>): Promise<void> {
    const gigRef = doc(db, 'gigs', gigId);
    await updateDoc(gigRef, {
      applicants: arrayUnion({
        ...application,
        appliedAt: serverTimestamp(),
        status: 'pending'
      }),
      updatedAt: serverTimestamp()
    });
  }

  // Startups
  static async createStartup(startupData: Omit<Startup, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'startups'), {
      ...startupData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  }

  static async getStartups(): Promise<Startup[]> {
    const querySnapshot = await getDocs(
      query(collection(db, 'startups'), orderBy('createdAt', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Startup));
  }

  static async applyToStartup(startupId: string, application: Omit<StartupApplication, 'appliedAt' | 'status'>): Promise<void> {
    const startupRef = doc(db, 'startups', startupId);
    await updateDoc(startupRef, {
      applicants: arrayUnion({
        ...application,
        appliedAt: serverTimestamp(),
        status: 'pending'
      }),
      updatedAt: serverTimestamp()
    });
  }

  // Chat Rooms
  static async createChatRoom(roomData: Omit<ChatRoom, 'id' | 'createdAt' | 'lastActivity'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'chatRooms'), {
      ...roomData,
      createdAt: serverTimestamp(),
      lastActivity: serverTimestamp()
    });
    return docRef.id;
  }

  static async getChatRooms(): Promise<ChatRoom[]> {
    const querySnapshot = await getDocs(
      query(collection(db, 'chatRooms'), orderBy('lastActivity', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatRoom));
  }

  static async joinChatRoom(roomId: string, userId: string): Promise<void> {
    const roomRef = doc(db, 'chatRooms', roomId);
    await updateDoc(roomRef, {
      members: arrayUnion(userId),
      lastActivity: serverTimestamp()
    });
  }

  // Chat Messages
  static async sendMessage(messageData: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'chatMessages'), {
      ...messageData,
      timestamp: serverTimestamp()
    });

    // Update room's last activity
    const roomRef = doc(db, 'chatRooms', messageData.roomId);
    await updateDoc(roomRef, {
      lastActivity: serverTimestamp()
    });

    return docRef.id;
  }

  static async getChatMessages(roomId: string): Promise<ChatMessage[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, 'chatMessages'),
        where('roomId', '==', roomId),
        orderBy('timestamp', 'asc')
      )
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
  }

  static async addReaction(messageId: string, emoji: string, userId: string): Promise<void> {
    const messageRef = doc(db, 'chatMessages', messageId);
    const messageDoc = await getDoc(messageRef);
    
    if (messageDoc.exists()) {
      const data = messageDoc.data() as ChatMessage;
      const reactions = data.reactions || {};
      
      if (!reactions[emoji]) {
        reactions[emoji] = [];
      }
      
      if (!reactions[emoji].includes(userId)) {
        reactions[emoji].push(userId);
      } else {
        reactions[emoji] = reactions[emoji].filter(id => id !== userId);
        if (reactions[emoji].length === 0) {
          delete reactions[emoji];
        }
      }
      
      await updateDoc(messageRef, { reactions });
    }
  }

  // User Profiles
  static async createUserProfile(profileData: UserProfile): Promise<void> {
    await setDoc(doc(db, 'userProfiles', profileData.uid), {
      ...profileData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
  }

  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const docSnap = await getDoc(doc(db, 'userProfiles', userId));
    return docSnap.exists() ? { ...docSnap.data() } as UserProfile : null;
  }

  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    await updateDoc(doc(db, 'userProfiles', userId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }

  // Onboarding
  static async saveOnboardingResponse(userId: string, onboardingData: OnboardingData): Promise<void> {
    await updateDoc(doc(db, 'userProfiles', userId), {
      onboardingData,
      onboardingCompleted: true,
      updatedAt: serverTimestamp()
    });
  }

  // Analytics
  static async getUserAnalytics(userId: string): Promise<UserAnalytics | null> {
    const docSnap = await getDoc(doc(db, 'userAnalytics', userId));
    return docSnap.exists() ? { ...docSnap.data() } as UserAnalytics : null;
  }

  static async updateUserAnalytics(userId: string, updates: Partial<UserAnalytics>): Promise<void> {
    const analyticsRef = doc(db, 'userAnalytics', userId);
    const docSnap = await getDoc(analyticsRef);
    
    if (docSnap.exists()) {
      await updateDoc(analyticsRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } else {
      await updateDoc(analyticsRef, {
        userId,
        profileViews: 0,
        postsCreated: 0,
        messagesPosted: 0,
        podsJoined: 0,
        gigsApplied: 0,
        startupsApplied: 0,
        completedProjects: 0,
        earnings: 0,
        ...updates,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
  }

  // Recommendations
  static async getRecommendations(userId: string): Promise<Recommendation | null> {
    const docSnap = await getDoc(doc(db, 'recommendations', userId));
    return docSnap.exists() ? { ...docSnap.data() } as Recommendation : null;
  }

  static async generateRecommendations(userId: string, userProfile: UserProfile): Promise<void> {
    // Get all data
    const [gigs, startups, pods] = await Promise.all([
      this.getGigs(),
      this.getStartups(),
      this.getPods()
    ]);

    // Simple recommendation algorithm based on user's onboarding data
    const userSkills = userProfile.onboardingData?.skills || [];
    const userInterests = userProfile.onboardingData?.interests || [];
    const userRole = userProfile.onboardingData?.role;

    // Recommend gigs based on skills
    const recommendedGigs = gigs.filter(gig => 
      gig.skills.some(skill => userSkills.includes(skill)) ||
      userInterests.some(interest => gig.category.toLowerCase().includes(interest.toLowerCase()))
    ).slice(0, 5);

    // Recommend startups based on interests and role
    const recommendedStartups = startups.filter(startup =>
      userInterests.some(interest => 
        startup.industry.toLowerCase().includes(interest.toLowerCase()) ||
        startup.description.toLowerCase().includes(interest.toLowerCase())
      ) || (userRole === 'founder' && startup.stage === 'pre-seed')
    ).slice(0, 5);

    // Recommend pods based on interests
    const recommendedPods = pods.filter(pod =>
      userInterests.some(interest =>
        pod.category.toLowerCase().includes(interest.toLowerCase()) ||
        pod.name.toLowerCase().includes(interest.toLowerCase()) ||
        pod.tags.some(tag => tag.toLowerCase().includes(interest.toLowerCase()))
      )
    ).slice(0, 5);

    // Save recommendations
    await updateDoc(doc(db, 'recommendations', userId), {
      userId,
      recommendedGigs,
      recommendedStartups,
      recommendedPods,
      recommendedUsers: [], // TODO: Implement user recommendations
      lastUpdated: serverTimestamp()
    });
  }

  // Real-time listeners
  static subscribeToCollection(
    collectionName: string,
    callback: (data: any[]) => void,
    queryConstraints: any[] = []
  ): () => void {
    const q = query(collection(db, collectionName), ...queryConstraints);
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(data);
    });
  }

  static subscribeToChatMessages(
    roomId: string,
    callback: (messages: ChatMessage[]) => void
  ): () => void {
    const q = query(
      collection(db, 'chatMessages'),
      where('roomId', '==', roomId),
      orderBy('timestamp', 'asc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as ChatMessage));
      callback(messages);
    });
  }

  static subscribeToPodPosts(
    podId: string,
    callback: (posts: PodPost[]) => void
  ): () => void {
    const q = query(
      collection(db, 'podPosts'),
      where('podId', '==', podId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as PodPost));
      callback(posts);
    });
  }
}
    });
  }
}
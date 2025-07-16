import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
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

// Types
export interface Pod {
  id?: string;
  name: string;
  slug: string;
  description: string;
  theme: string;
  icon: string;
  members: string[];
  posts: string[];
  events: any[];
  pinnedResources: any[];
  createdAt: Timestamp;
  memberCount: number;
  isActive: boolean;
}

export interface Post {
  id?: string;
  podId: string;
  userId: string;
  content: string;
  imageUrl?: string;
  likes: string[];
  replies: string[];
  bookmarks: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Reply {
  id?: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: Timestamp;
}

export interface Room {
  id?: string;
  name: string;
  description: string;
  members: string[];
  createdBy: string;
  isPrivate: boolean;
  messages: string[];
  createdAt: Timestamp;
  lastActivity: Timestamp;
}

export interface Message {
  id?: string;
  roomId: string;
  senderId: string;
  content: string;
  attachment?: {
    url: string;
    name: string;
    type: string;
    size?: string;
  };
  timestamp: Timestamp;
  type: 'text' | 'image' | 'file' | 'video';
}

export interface Application {
  userId: string;
  appliedAt: Timestamp;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  coverLetter?: string;
  portfolio?: string;
  userProfile?: {
    name: string;
    email: string;
    avatar?: string;
    skills: string[];
    rating: number;
    completedProjects: number;
  };
}

export interface Startup {
  id?: string;
  name: string;
  description: string;
  industry: string;
  stage: string;
  location: string;
  createdBy: string;
  applicants: Application[];
  status: 'active' | 'closed' | 'paused';
  funding: string;
  equity: string;
  requirements: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  applicantCount: number;
}

export interface FreelanceGig {
  id?: string;
  title: string;
  description: string;
  tags: string[];
  budget: string;
  duration: string;
  postedBy: string;
  applicants: Application[];
  status: 'open' | 'closed' | 'in-progress' | 'completed';
  requirements: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  applicantCount: number;
}

export interface UserProfile {
  id?: string;
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  skills: string[];
  interests: string[];
  location?: string;
  joinedPods: string[];
  joinedRooms: string[];
  postedStartups: string[];
  postedGigs: string[];
  appliedGigs: Array<{
    gigId: string;
    appliedAt: Timestamp;
    status: string;
  }>;
  appliedStartups: Array<{
    startupId: string;
    appliedAt: Timestamp;
    status: string;
  }>;
  bookmarkedGigs: string[];
  bookmarkedStartups: string[];
  bookmarks: string[];
  activityLog: any[];
  rating: number;
  completedProjects: number;
  totalEarnings: string;
  joinDate: Timestamp;
}

export interface Notification {
  id?: string;
  userId: string;
  type: 'pod_activity' | 'room_message' | 'gig_application' | 'startup_application' | 'status_change';
  title: string;
  message: string;
  seen: boolean;
  timestamp: Timestamp;
  relatedId?: string;
}

// Firestore service functions
export class FirestoreService {
  // Pods
  static async createPod(pod: Omit<Pod, 'id' | 'createdAt' | 'memberCount'>): Promise<string> {
    if (!db) throw new Error('Firestore not initialized');
    const docRef = await addDoc(collection(db, 'pods'), {
      ...pod,
      createdAt: serverTimestamp(),
      memberCount: pod.members.length
    });
    return docRef.id;
  }

  static async getPods(): Promise<Pod[]> {
    if (!db) throw new Error('Firestore not initialized');
    const querySnapshot = await getDocs(
      query(collection(db, 'pods'), orderBy('createdAt', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pod));
  }

  static async getPod(id: string): Promise<Pod | null> {
    if (!db) throw new Error('Firestore not initialized');
    const docSnap = await getDoc(doc(db, 'pods', id));
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Pod : null;
  }

  static async joinPod(podId: string, userId: string): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');
    await updateDoc(doc(db, 'pods', podId), {
      members: arrayUnion(userId),
      memberCount: increment(1)
    });
    
    // Update user profile
    await updateDoc(doc(db, 'users', userId), {
      joinedPods: arrayUnion(podId)
    });
  }

  static async leavePod(podId: string, userId: string): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');
    await updateDoc(doc(db, 'pods', podId), {
      members: arrayRemove(userId),
      memberCount: increment(-1)
    });
    
    // Update user profile
    await updateDoc(doc(db, 'users', userId), {
      joinedPods: arrayRemove(podId)
    });
  }

  // Posts
  static async createPost(post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!db) throw new Error('Firestore not initialized');
    const docRef = await addDoc(collection(db, 'posts'), {
      ...post,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  }

  static async getPodPosts(podId: string): Promise<Post[]> {
    if (!db) throw new Error('Firestore not initialized');
    const querySnapshot = await getDocs(
      query(
        collection(db, 'posts'),
        where('podId', '==', podId),
        orderBy('createdAt', 'desc')
      )
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
  }

  static async likePost(postId: string, userId: string): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');
    await updateDoc(doc(db, 'posts', postId), {
      likes: arrayUnion(userId)
    });
  }

  static async unlikePost(postId: string, userId: string): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');
    await updateDoc(doc(db, 'posts', postId), {
      likes: arrayRemove(userId)
    });
  }

  static async bookmarkPost(postId: string, userId: string): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');
    await updateDoc(doc(db, 'posts', postId), {
      bookmarks: arrayUnion(userId)
    });
  }

  // Rooms
  static async createRoom(room: Omit<Room, 'id' | 'createdAt' | 'lastActivity'>): Promise<string> {
    if (!db) throw new Error('Firestore not initialized');
    const docRef = await addDoc(collection(db, 'rooms'), {
      ...room,
      createdAt: serverTimestamp(),
      lastActivity: serverTimestamp()
    });
    
    // Update user profile
    await updateDoc(doc(db, 'users', room.createdBy), {
      joinedRooms: arrayUnion(docRef.id)
    });
    
    return docRef.id;
  }

  static async getRooms(userId: string): Promise<Room[]> {
    if (!db) throw new Error('Firestore not initialized');
    const querySnapshot = await getDocs(
      query(
        collection(db, 'rooms'),
        where('members', 'array-contains', userId),
        orderBy('lastActivity', 'desc')
      )
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room));
  }

  static async joinRoom(roomId: string, userId: string): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');
    await updateDoc(doc(db, 'rooms', roomId), {
      members: arrayUnion(userId)
    });
    
    // Update user profile
    await updateDoc(doc(db, 'users', userId), {
      joinedRooms: arrayUnion(roomId)
    });
  }

  // Messages
  static async sendMessage(message: Omit<Message, 'id' | 'timestamp'>): Promise<string> {
    if (!db) throw new Error('Firestore not initialized');
    const docRef = await addDoc(collection(db, 'messages'), {
      ...message,
      timestamp: serverTimestamp()
    });
    
    // Update room's last activity
    await updateDoc(doc(db, 'rooms', message.roomId), {
      lastActivity: serverTimestamp()
    });
    
    return docRef.id;
  }

  static async getRoomMessages(roomId: string): Promise<Message[]> {
    if (!db) throw new Error('Firestore not initialized');
    const querySnapshot = await getDocs(
      query(
        collection(db, 'messages'),
        where('roomId', '==', roomId),
        orderBy('timestamp', 'asc')
      )
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
  }

  // Startups with Application Tracking
  static async createStartup(startup: Omit<Startup, 'id' | 'createdAt' | 'updatedAt' | 'applicantCount'>): Promise<string> {
    if (!db) throw new Error('Firestore not initialized');
    const docRef = await addDoc(collection(db, 'startups'), {
      ...startup,
      applicantCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Update user profile
    await updateDoc(doc(db, 'users', startup.createdBy), {
      postedStartups: arrayUnion(docRef.id)
    });
    
    return docRef.id;
  }

  static async getStartups(): Promise<Startup[]> {
    if (!db) throw new Error('Firestore not initialized');
    const querySnapshot = await getDocs(
      query(collection(db, 'startups'), orderBy('createdAt', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Startup));
  }

  static async applyToStartup(startupId: string, userId: string, applicationData?: { coverLetter?: string; portfolio?: string }): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');
    
    // Get user profile for application
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userProfile = userDoc.data() as UserProfile;
    
    const application: Application = {
      userId,
      appliedAt: serverTimestamp() as Timestamp,
      status: 'pending',
      coverLetter: applicationData?.coverLetter,
      portfolio: applicationData?.portfolio,
      userProfile: {
        name: userProfile.displayName,
        email: userProfile.email,
        avatar: userProfile.photoURL,
        skills: userProfile.skills,
        rating: userProfile.rating,
        completedProjects: userProfile.completedProjects
      }
    };
    
    // Update startup with application
    await updateDoc(doc(db, 'startups', startupId), {
      applicants: arrayUnion(application),
      applicantCount: increment(1)
    });
    
    // Update user profile with applied startup
    await updateDoc(doc(db, 'users', userId), {
      appliedStartups: arrayUnion({
        startupId,
        appliedAt: serverTimestamp(),
        status: 'pending'
      })
    });
  }

  // Freelance Gigs with Application Tracking
  static async createGig(gig: Omit<FreelanceGig, 'id' | 'createdAt' | 'updatedAt' | 'applicantCount'>): Promise<string> {
    if (!db) throw new Error('Firestore not initialized');
    const docRef = await addDoc(collection(db, 'gigs'), {
      ...gig,
      applicantCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Update user profile
    await updateDoc(doc(db, 'users', gig.postedBy), {
      postedGigs: arrayUnion(docRef.id)
    });
    
    return docRef.id;
  }

  static async getGigs(): Promise<FreelanceGig[]> {
    if (!db) throw new Error('Firestore not initialized');
    const querySnapshot = await getDocs(
      query(collection(db, 'gigs'), orderBy('createdAt', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FreelanceGig));
  }

  static async applyToGig(gigId: string, userId: string, applicationData?: { coverLetter?: string; portfolio?: string }): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');
    
    // Get user profile for application
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userProfile = userDoc.data() as UserProfile;
    
    const application: Application = {
      userId,
      appliedAt: serverTimestamp() as Timestamp,
      status: 'pending',
      coverLetter: applicationData?.coverLetter,
      portfolio: applicationData?.portfolio,
      userProfile: {
        name: userProfile.displayName,
        email: userProfile.email,
        avatar: userProfile.photoURL,
        skills: userProfile.skills,
        rating: userProfile.rating,
        completedProjects: userProfile.completedProjects
      }
    };
    
    // Update gig with application
    await updateDoc(doc(db, 'gigs', gigId), {
      applicants: arrayUnion(application),
      applicantCount: increment(1)
    });
    
    // Update user profile with applied gig
    await updateDoc(doc(db, 'users', userId), {
      appliedGigs: arrayUnion({
        gigId,
        appliedAt: serverTimestamp(),
        status: 'pending'
      })
    });
  }

  // Bookmark functions
  static async bookmarkGig(gigId: string, userId: string): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');
    await updateDoc(doc(db, 'users', userId), {
      bookmarkedGigs: arrayUnion(gigId)
    });
  }

  static async unbookmarkGig(gigId: string, userId: string): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');
    await updateDoc(doc(db, 'users', userId), {
      bookmarkedGigs: arrayRemove(gigId)
    });
  }

  static async bookmarkStartup(startupId: string, userId: string): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');
    await updateDoc(doc(db, 'users', userId), {
      bookmarkedStartups: arrayUnion(startupId)
    });
  }

  static async unbookmarkStartup(startupId: string, userId: string): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');
    await updateDoc(doc(db, 'users', userId), {
      bookmarkedStartups: arrayRemove(startupId)
    });
  }

  // Get user's posted opportunities
  static async getUserPostedGigs(userId: string): Promise<FreelanceGig[]> {
    if (!db) throw new Error('Firestore not initialized');
    const querySnapshot = await getDocs(
      query(
        collection(db, 'gigs'),
        where('postedBy', '==', userId),
        orderBy('createdAt', 'desc')
      )
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FreelanceGig));
  }

  static async getUserPostedStartups(userId: string): Promise<Startup[]> {
    if (!db) throw new Error('Firestore not initialized');
    const querySnapshot = await getDocs(
      query(
        collection(db, 'startups'),
        where('createdBy', '==', userId),
        orderBy('createdAt', 'desc')
      )
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Startup));
  }

  // Get bookmarked opportunities
  static async getBookmarkedGigs(gigIds: string[]): Promise<FreelanceGig[]> {
    if (!db || gigIds.length === 0) return [];
    const gigs: FreelanceGig[] = [];
    
    for (const gigId of gigIds) {
      const docSnap = await getDoc(doc(db, 'gigs', gigId));
      if (docSnap.exists()) {
        gigs.push({ id: docSnap.id, ...docSnap.data() } as FreelanceGig);
      }
    }
    
    return gigs;
  }

  static async getBookmarkedStartups(startupIds: string[]): Promise<Startup[]> {
    if (!db || startupIds.length === 0) return [];
    const startups: Startup[] = [];
    
    for (const startupId of startupIds) {
      const docSnap = await getDoc(doc(db, 'startups', startupId));
      if (docSnap.exists()) {
        startups.push({ id: docSnap.id, ...docSnap.data() } as Startup);
      }
    }
    
    return startups;
  }

  // User Profiles
  static async createUserProfile(profile: Omit<UserProfile, 'id' | 'joinDate'>): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');
    await updateDoc(doc(db, 'users', profile.uid), {
      ...profile,
      appliedGigs: [],
      appliedStartups: [],
      bookmarkedGigs: [],
      bookmarkedStartups: [],
      joinDate: serverTimestamp()
    });
  }

  static async getUserProfile(uid: string): Promise<UserProfile | null> {
    if (!db) throw new Error('Firestore not initialized');
    const docSnap = await getDoc(doc(db, 'users', uid));
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as UserProfile : null;
  }

  static async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');
    await updateDoc(doc(db, 'users', uid), updates);
  }

  // Notifications
  static async createNotification(notification: Omit<Notification, 'id' | 'timestamp'>): Promise<string> {
    if (!db) throw new Error('Firestore not initialized');
    const docRef = await addDoc(collection(db, 'notifications'), {
      ...notification,
      timestamp: serverTimestamp()
    });
    return docRef.id;
  }

  static async getUserNotifications(userId: string): Promise<Notification[]> {
    if (!db) throw new Error('Firestore not initialized');
    const querySnapshot = await getDocs(
      query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(50)
      )
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
  }

  static async markNotificationAsRead(notificationId: string): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');
    await updateDoc(doc(db, 'notifications', notificationId), {
      seen: true
    });
  }

  // Real-time listeners
  static subscribeToRoomMessages(roomId: string, callback: (messages: Message[]) => void) {
    if (!db) throw new Error('Firestore not initialized');
    return onSnapshot(
      query(
        collection(db, 'messages'),
        where('roomId', '==', roomId),
        orderBy('timestamp', 'asc')
      ),
      (snapshot) => {
        const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
        callback(messages);
      }
    );
  }

  static subscribeToUserNotifications(userId: string, callback: (notifications: Notification[]) => void) {
    if (!db) throw new Error('Firestore not initialized');
    return onSnapshot(
      query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(20)
      ),
      (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
        callback(notifications);
      }
    );
  }
}
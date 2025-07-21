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
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';

// Data Types
export interface Pod {
  id?: string;
  name: string;
  description: string;
  slug: string;
  theme: string;
  icon: string;
  tags: string[];
  category?: string;
  memberCount?: number;
  members: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  isPrivate?: boolean;
  lastActivity?: Timestamp;
  messageCount?: number;
  onlineMembers?: string[];
  pinnedMessages?: string[];
  moderators?: string[];
}

export interface PodPost {
  id?: string;
  podId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  type?: 'text' | 'image' | 'file' | 'system';
  imageUrl?: string;
  attachment?: {
    url: string;
    name: string;
    type: string;
    size: string;
  };
  likes: string[];
  comments: PodComment[];
  bookmarks: string[];
  reactions?: { [emoji: string]: string[] };
  isPinned?: boolean;
  isReported?: boolean;
  reportedBy?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  editedAt?: Timestamp;
  isEdited?: boolean;
}

export interface PodComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
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
  category?: string;
  members: string[];
  createdBy: string;
  createdAt: Timestamp;
  lastActivity: Timestamp;
  isPrivate: boolean;
  avatar?: string;
  lastMessage?: {
    content: string;
    senderName: string;
    timestamp: Timestamp;
  };
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
  joinedPods: string[];
  joinedRooms: string[];
  postedStartups: string[];
  postedGigs: string[];
  appliedGigs: string[];
  appliedStartups: string[];
  bookmarkedGigs: string[];
  bookmarkedStartups: string[];
  bookmarks: string[];
  activityLog: any[];
  rating: number;
  completedProjects: number;
  totalEarnings: string;
  badges?: string[];
  isOnline?: boolean;
  lastSeen?: Timestamp;
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
  // User Profiles
  static async createUserProfile(profileData: Omit<UserProfile, 'id' | 'joinDate'>): Promise<void> {
    await setDoc(doc(db, 'users', profileData.uid), {
      ...profileData,
      joinDate: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
  }

  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const docSnap = await getDoc(doc(db, 'users', userId));
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as UserProfile : null;
  }

  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    await updateDoc(doc(db, 'users', userId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }

  static async updateUserOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
    await updateDoc(doc(db, 'users', userId), {
      isOnline,
      lastSeen: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  // Pods
  static async createPod(podData: Omit<Pod, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'pods'), {
      ...podData,
      memberCount: podData.members?.length || 0,
      messageCount: 0,
      onlineMembers: [],
      pinnedMessages: [],
      moderators: [podData.createdBy],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastActivity: serverTimestamp()
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
    const batch = writeBatch(db);
    
    // Update pod
    const podRef = doc(db, 'pods', podId);
    batch.update(podRef, {
      members: arrayUnion(userId),
      memberCount: increment(1),
      updatedAt: serverTimestamp(),
      lastActivity: serverTimestamp()
    });
    
    // Update user profile
    const userRef = doc(db, 'users', userId);
    batch.update(userRef, {
      joinedPods: arrayUnion(podId),
      updatedAt: serverTimestamp()
    });
    
    await batch.commit();
  }

  static async leavePod(podId: string, userId: string): Promise<void> {
    const batch = writeBatch(db);
    
    // Update pod
    const podRef = doc(db, 'pods', podId);
    batch.update(podRef, {
      members: arrayRemove(userId),
      memberCount: increment(-1),
      updatedAt: serverTimestamp()
    });
    
    // Update user profile
    const userRef = doc(db, 'users', userId);
    batch.update(userRef, {
      joinedPods: arrayRemove(podId),
      updatedAt: serverTimestamp()
    });
    
    await batch.commit();
  }

  static async updatePodOnlineMembers(podId: string, onlineMembers: string[]): Promise<void> {
    const podRef = doc(db, 'pods', podId);
    await updateDoc(podRef, {
      onlineMembers,
      updatedAt: serverTimestamp()
    });
  }

  // Pod Posts
  static async createPodPost(podId: string, userId: string, content: string, imageUrl?: string): Promise<string> {
    // Get user profile for name and avatar
    const userProfile = await this.getUserProfile(userId);
    
    const postData = {
      podId,
      userId,
      userName: userProfile?.displayName || 'Anonymous User',
      userAvatar: userProfile?.photoURL || '',
      content: content.trim(),
      type: imageUrl ? 'image' : 'text',
      imageUrl,
      likes: [],
      comments: [],
      bookmarks: [],
      reactions: {},
      isPinned: false,
      isReported: false,
      reportedBy: [],
      isEdited: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const batch = writeBatch(db);
    
    // Create post
    const postRef = doc(collection(db, 'podPosts'));
    batch.set(postRef, postData);
    
    // Update pod activity
    const podRef = doc(db, 'pods', podId);
    batch.update(podRef, {
      messageCount: increment(1),
      lastActivity: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    await batch.commit();
    return postRef.id;
  }

  static async createPost(postData: Omit<PodPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'posts'), {
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

  static async likePost(postId: string, userId: string): Promise<void> {
    const postRef = doc(db, 'podPosts', postId);
    await updateDoc(postRef, {
      likes: arrayUnion(userId),
      updatedAt: serverTimestamp()
    });
  }

  static async unlikePost(postId: string, userId: string): Promise<void> {
    const postRef = doc(db, 'podPosts', postId);
    await updateDoc(postRef, {
      likes: arrayRemove(userId),
      updatedAt: serverTimestamp()
    });
  }

  static async bookmarkPost(postId: string, userId: string): Promise<void> {
    const postRef = doc(db, 'podPosts', postId);
    await updateDoc(postRef, {
      bookmarks: arrayUnion(userId),
      updatedAt: serverTimestamp()
    });
  }

  static async addReactionToPost(postId: string, emoji: string, userId: string): Promise<void> {
    const postRef = doc(db, 'podPosts', postId);
    const postDoc = await getDoc(postRef);
    
    if (postDoc.exists()) {
      const data = postDoc.data() as PodPost;
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
      
      await updateDoc(postRef, { 
        reactions,
        updatedAt: serverTimestamp()
      });
    }
  }

  static async pinPost(postId: string, podId: string): Promise<void> {
    const batch = writeBatch(db);
    
    // Update post
    const postRef = doc(db, 'podPosts', postId);
    batch.update(postRef, {
      isPinned: true,
      updatedAt: serverTimestamp()
    });
    
    // Update pod
    const podRef = doc(db, 'pods', podId);
    batch.update(podRef, {
      pinnedMessages: arrayUnion(postId),
      updatedAt: serverTimestamp()
    });
    
    await batch.commit();
  }

  static async reportPost(postId: string, userId: string, reason: string): Promise<void> {
    const postRef = doc(db, 'podPosts', postId);
    await updateDoc(postRef, {
      isReported: true,
      reportedBy: arrayUnion(userId),
      updatedAt: serverTimestamp()
    });
    
    // Create report record
    await addDoc(collection(db, 'reports'), {
      postId,
      reportedBy: userId,
      reason,
      status: 'pending',
      createdAt: serverTimestamp()
    });
  }

  // Real-time subscriptions
  static subscribeToPodPosts(
    podId: string,
    callback: (posts: PodPost[]) => void
  ): () => void {
    try {
      const q = query(
        collection(db, 'podPosts'),
        where('podId', '==', podId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      return onSnapshot(q, (snapshot) => {
        const posts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as PodPost));
        callback(posts);
      }, (error) => {
        console.error('Error in pod posts subscription:', error);
        if (error.code === 'failed-precondition') {
          // Fallback without orderBy
          const simpleQ = query(
            collection(db, 'podPosts'),
            where('podId', '==', podId),
            limit(50)
          );
          
          return onSnapshot(simpleQ, (snapshot) => {
            const posts = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            } as PodPost));
            posts.sort((a, b) => {
              const aTime = a.createdAt?.seconds || 0;
              const bTime = b.createdAt?.seconds || 0;
              return bTime - aTime;
            });
            callback(posts);
          });
        }
        throw error;
      });
    } catch (error) {
      console.error('Error setting up pod posts subscription:', error);
      throw error;
    }
  }

  static subscribeToUserNotifications(
    userId: string,
    callback: (notifications: any[]) => void
  ): () => void {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    
    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(notifications);
    });
  }

  static async markNotificationAsRead(notificationId: string): Promise<void> {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      seen: true,
      readAt: serverTimestamp()
    });
  }

  // Rooms
  static async createRoom(roomData: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'rooms'), {
      ...roomData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastActivity: serverTimestamp()
    });
    return docRef.id;
  }

  static async getRooms(userId: string): Promise<Room[]> {
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
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      members: arrayUnion(userId),
      updatedAt: serverTimestamp(),
      lastActivity: serverTimestamp()
    });
  }

  // Messages
  static async sendMessage(messageData: Omit<Message, 'id' | 'timestamp'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'messages'), {
      ...messageData,
      timestamp: serverTimestamp()
    });
    return docRef.id;
  }

  static subscribeToRoomMessages(
    roomId: string,
    callback: (messages: Message[]) => void
  ): () => void {
    const q = query(
      collection(db, 'messages'),
      where('roomId', '==', roomId),
      orderBy('timestamp', 'asc'),
      limit(100)
    );
    
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Message));
      callback(messages);
    });
  }

  // Chat Messages for Pods
  static async sendChatMessage(messageData: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'chatMessages'), {
      ...messageData,
      reactions: {},
      timestamp: serverTimestamp()
    });
    return docRef.id;
  }

  static subscribeToRoomChatMessages(
    roomId: string,
    callback: (messages: ChatMessage[]) => void
  ): () => void {
    const q = query(
      collection(db, 'chatMessages'),
      where('roomId', '==', roomId),
      orderBy('timestamp', 'asc'),
      limit(100)
    );
    
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ChatMessage));
      callback(messages);
    });
  }

  static async addReactionToMessage(messageId: string, emoji: string, userId: string): Promise<void> {
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

  static async applyToGig(gigId: string, userId: string, applicationData?: { coverLetter?: string; portfolio?: string }): Promise<void> {
    const gigRef = doc(db, 'gigs', gigId);
    const userProfile = await this.getUserProfile(userId);
    
    await updateDoc(gigRef, {
      applicants: arrayUnion({
        userId,
        userName: userProfile?.displayName || 'Anonymous User',
        userAvatar: userProfile?.photoURL || '',
        coverLetter: applicationData?.coverLetter || '',
        portfolio: applicationData?.portfolio || '',
        appliedAt: serverTimestamp(),
        status: 'pending'
      }),
      updatedAt: serverTimestamp()
    });
  }

  static async bookmarkGig(gigId: string, userId: string): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      bookmarkedGigs: arrayUnion(gigId),
      updatedAt: serverTimestamp()
    });
  }

  static async unbookmarkGig(gigId: string, userId: string): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      bookmarkedGigs: arrayRemove(gigId),
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

  static async applyToStartup(startupId: string, userId: string, applicationData?: { coverLetter?: string; portfolio?: string }): Promise<void> {
    const startupRef = doc(db, 'startups', startupId);
    const userProfile = await this.getUserProfile(userId);
    
    await updateDoc(startupRef, {
      applicants: arrayUnion({
        userId,
        userName: userProfile?.displayName || 'Anonymous User',
        userAvatar: userProfile?.photoURL || '',
        coverLetter: applicationData?.coverLetter || '',
        portfolio: applicationData?.portfolio || '',
        appliedAt: serverTimestamp(),
        status: 'pending'
      }),
      updatedAt: serverTimestamp()
    });
  }

  static async bookmarkStartup(startupId: string, userId: string): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      bookmarkedStartups: arrayUnion(startupId),
      updatedAt: serverTimestamp()
    });
  }

  static async unbookmarkStartup(startupId: string, userId: string): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      bookmarkedStartups: arrayRemove(startupId),
      updatedAt: serverTimestamp()
    });
  }

  // Onboarding
  static async saveOnboardingResponse(onboardingData: any): Promise<void> {
    await updateDoc(doc(db, 'users', onboardingData.userId), {
      onboardingData,
      onboardingCompleted: true,
      updatedAt: serverTimestamp()
    });
  }

  static async getOnboardingResponse(userId: string): Promise<any | null> {
    const userProfile = await this.getUserProfile(userId);
    return userProfile?.onboardingData || null;
  }

  // Analytics
  static async getUserAnalytics(userId: string): Promise<UserAnalytics | null> {
    const docSnap = await getDoc(doc(db, 'userAnalytics', userId));
    return docSnap.exists() ? { ...docSnap.data() } as UserAnalytics : null;
  }

  // Recommendations
  static async getPersonalizedRecommendations(userId: string): Promise<Recommendation | null> {
    const docSnap = await getDoc(doc(db, 'recommendations', userId));
    return docSnap.exists() ? { ...docSnap.data() } as Recommendation : null;
  }
}
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db, isFirebaseConfigured } from '../lib/firebase';
import { FirestoreService, UserProfile } from '../lib/firestore';
import { seedSampleData } from '../lib/seedData';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  isFirebaseReady: boolean;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSeededData, setHasSeededData] = useState(false);
  const firebaseReady = isFirebaseConfigured();

  const createUserProfile = async (user: User, additionalData?: any) => {
    if (!user || !db) return;

    try {
      // Check if user profile already exists
      const existingProfile = await FirestoreService.getUserProfile(user.uid);
      
      if (!existingProfile) {
        // Create new user profile with enhanced fields
        const newProfile: Omit<UserProfile, 'id' | 'joinDate'> = {
          uid: user.uid,
          email: user.email || '',
          displayName: additionalData?.displayName || user.displayName || 'Anonymous User',
          photoURL: user.photoURL || '',
          bio: '',
          skills: [],
          interests: [],
          location: '',
          onboardingCompleted: false,
          joinedPods: [],
          joinedRooms: [],
          postedStartups: [],
          postedGigs: [],
          appliedGigs: [],
          appliedStartups: [],
          bookmarkedGigs: [],
          bookmarkedStartups: [],
          bookmarks: [],
          activityLog: [],
          rating: 0,
          completedProjects: 0,
          totalEarnings: '$0'
        };

        await FirestoreService.createUserProfile(newProfile);
        
        // Fetch the created profile
        const createdProfile = await FirestoreService.getUserProfile(user.uid);
        setUserProfile(createdProfile);
      } else {
        setUserProfile(existingProfile);
      }
    } catch (error) {
      console.error('Error creating/fetching user profile:', error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    
    try {
      await FirestoreService.updateUserProfile(currentUser.uid, updates);
      const updatedProfile = await FirestoreService.getUserProfile(currentUser.uid);
      setUserProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials.');
    }
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await createUserProfile(result.user);
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      
      // Handle specific popup errors
      if (error.code === 'auth/popup-blocked') {
        throw new Error('Pop-up was blocked by your browser. Please allow pop-ups for this site and try again.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('Sign-in was cancelled. Please try again.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in window was closed. Please try again.');
      } else if (error.code === 'auth/unauthorized-domain') {
        throw new Error('This domain is not authorized for Firebase authentication. Please contact support.');
      }
      
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (!auth) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials.');
    }
    
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await createUserProfile(result.user);
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    if (!auth) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials.');
    }
    
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await createUserProfile(result.user, { displayName });
    } catch (error) {
      console.error('Error signing up with email:', error);
      throw error;
    }
  };

  const logout = async () => {
    if (!auth) {
      throw new Error('Firebase is not configured. Please set up your Firebase credentials.');
    }
    
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Seed sample data only when user is authenticated
  const seedDataIfNeeded = async (user: User | null) => {
    if (!firebaseReady || !user || hasSeededData) return;
    
    try {
      // Check if data already exists by trying to get pods
      const pods = await FirestoreService.getPods();
      if (pods.length === 0) {
        console.log('No existing data found, seeding sample data...');
        await seedSampleData();
      }
      setHasSeededData(true);
    } catch (error) {
      console.warn('Could not check/seed data - this may be due to Firestore security rules:', error);
      // Don't throw the error, just log it and continue
      // This allows the app to function even if seeding fails due to permissions
      setHasSeededData(true); // Set to true to prevent infinite retries
    }
  };

  useEffect(() => {
    if (!firebaseReady || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await createUserProfile(user);
        // Only attempt seeding after user is authenticated
        await seedDataIfNeeded(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [firebaseReady]);

  const value = {
    currentUser,
    userProfile,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logout,
    isFirebaseReady: firebaseReady,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
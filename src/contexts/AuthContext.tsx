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
          totalEarnings: '$0',
          badges: [],
          isOnline: true,
          createdAt: new Date() as any,
          updatedAt: new Date() as any
        };

        await FirestoreService.createUserProfile(newProfile);

        // Fetch the created profile
        const createdProfile = await FirestoreService.getUserProfile(user.uid);
        setUserProfile(createdProfile);

        // Set user as online
        await FirestoreService.updateUserOnlineStatus(user.uid, true);
      } else {
        setUserProfile(existingProfile);
        // Update online status
        await FirestoreService.updateUserOnlineStatus(user.uid, true);
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
      // Set user as offline before signing out
      if (currentUser) {
        await FirestoreService.updateUserOnlineStatus(currentUser.uid, false);
      }
      await signOut(auth);
      setUserProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
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
// app.tsx - CORRECTED CODE
import React, { createContext, useContext, useState, useEffect, FC, ReactNode } from 'react';
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    User,
    Auth,
} from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, LogIn, UserPlus } from 'lucide-react';

// Import all necessary components
import PodsPage from './PodsPage';
import PodDetail from './PodDetail'; // <-- IMPORT PodDetail here
import RoomsPage from './RoomsPageTemp';
import RoomList from './RoomList';

// =========================================
// 1. Firebase Initialization & Auth Context
// =========================================

const firebaseConfig = {
    apiKey: "AIzaSyDoEPIqS_9wXRnWUWP-wTR_BqWBjqFCXVs",
    authDomain: "earnbuddy-641b3.firebaseapp.com",
    projectId: "earnbuddy-641b3",
    storageBucket: "earnbuddy-641b3.firebasestorage.app",
    messagingSenderId: "679982634262",
    appId: "1:679982634262:web:ef471fa3e4f99008216c37",
    measurementId: "G-Z09YD857RK"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

interface AuthContextType {
    currentUser: User | null;
    auth: Auth;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        auth,
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// =========================================
// 2. Authentication UI Components
// =========================================

const AuthPage: FC = () => {
    const [isLogin, setIsLogin] = useState<boolean>(true);
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const { auth } = useAuth();


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (err: any) {
            setError(err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md"
            >
                <h2 className="text-3xl font-bold text-center text-emerald-600 dark:text-emerald-400 mb-6">
                    {isLogin ? 'Welcome Back!' : 'Create Your Account'}
                </h2>
                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4"
                    >
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm">{error}</span>
                    </motion.div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            required
                        />
                    </div>
                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-lg shadow-md hover:from-emerald-700 hover:to-emerald-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>}
                        {isLogin ? (
                            <>
                                <LogIn className="w-5 h-5" />
                                <span>Log In</span>
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-5 h-5" />
                                <span>Sign Up</span>
                            </>
                        )}
                    </motion.button>
                </form>
                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline text-sm"
                    >
                        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// =========================================
// 3. Main Dashboard & Routing
// =========================================

const Dashboard: FC = () => {
    const { currentUser } = useAuth();
    
    const [view, setView] = useState<'rooms' | 'pods'>('rooms');
    const [selectedRoom, setSelectedRoom] = useState<{ id: string; name: string } | null>(null);
    const [selectedPod, setSelectedPod] = useState<any | null>(null);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (err) {
            console.error('Error signing out:', err);
        }
    };
    
    // This is the function that is causing the issue.
    // It is called in PodsPage and PodDetail to set the selected pod.
    // When called with no argument, it sets selectedPod to undefined.
    // In PodDetail, onLeavePod is called, which passes no argument.
    // This causes selectedPod to be undefined, which leads to the error.
    // The solution is to check for a null value when setting the selectedPod.

    const handleLeavePod = () => {
        setSelectedPod(null);
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
            <header className="bg-white dark:bg-gray-800 shadow-lg p-4 flex justify-between items-center sticky top-0 z-10">
                <h1 className="text-2xl font-bold">Welcome, {currentUser?.email}!</h1>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setView('rooms')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                            view === 'rooms' ? 'bg-emerald-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                    >
                        Rooms
                    </button>
                    <button
                        onClick={() => setView('pods')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                            view === 'pods' ? 'bg-emerald-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                    >
                        Pods
                    </button>
                    <button
                        onClick={handleSignOut}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </header>
            <main className="flex-1 p-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md min-h-[500px]">
                    {/* Conditional rendering based on the 'view' and selected item */}
                    <AnimatePresence mode="wait">
                        {view === 'rooms' ? (
                            selectedRoom ? (
                                <motion.div key="room-detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <RoomsPage room={selectedRoom} onLeaveRoom={() => setSelectedRoom(null)} />
                                </motion.div>
                            ) : (
                                <motion.div key="room-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <RoomList onSelectRoom={setSelectedRoom} />
                                </motion.div>
                            )
                        ) : ( 
                            selectedPod ? (
                                <motion.div key="pod-detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <PodDetail pod={selectedPod} onLeavePod={handleLeavePod} onLogout={handleSignOut} />
                                </motion.div>
                            ) : (
                                <motion.div key="pod-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <PodsPage onSelectPod={setSelectedPod} onLogout={handleSignOut} />
                                </motion.div>
                            )
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

const App: FC = () => {
    const { currentUser } = useAuth();
    return (
        <AnimatePresence mode="wait">
            {currentUser ? <Dashboard /> : <AuthPage />}
        </AnimatePresence>
    );
};

const RootApp: FC = () => (
    <AuthProvider>
        <App />
    </AuthProvider>
);

export default RootApp;
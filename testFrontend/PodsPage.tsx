import React, { FC, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from './App';
import { PlusCircle, Search, LogOut, Loader2, AlertCircle } from 'lucide-react';
import { signOut } from 'firebase/auth';

const BASE_URL = 'http://127.0.0.1:8000';

interface Pod {
    _id: string;
    name: string;
    description: string;
    isPrivate: boolean;
    members: string[];
}

interface PodsPageProps {
    onSelectPod: (pod: Pod, isJoined: boolean) => void;
    onLogout: () => void;
}

const PodsPage: FC<PodsPageProps> = ({ onSelectPod, onLogout }) => {
    const { currentUser } = useAuth();
    const [allPods, setAllPods] = useState<Pod[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    const fetchPods = useCallback(async () => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const idToken = await currentUser.getIdToken();

            // Fetch public pods
            const publicPodsResponse = await fetch(`${BASE_URL}/pods/`, {
                headers: { 'Authorization': `Bearer ${idToken}` },
            });
            if (!publicPodsResponse.ok) {
                throw new Error('Failed to fetch public pods.');
            }
            const publicPods: Pod[] = await publicPodsResponse.json();

            // Fetch private/member pods
            const myPodsResponse = await fetch(`${BASE_URL}/pods/my`, {
                headers: { 'Authorization': `Bearer ${idToken}` },
            });
            if (!myPodsResponse.ok) {
                throw new Error('Failed to fetch private pods.');
            }
            const myPods: Pod[] = await myPodsResponse.json();

            // Combine and deduplicate the lists
            const combinedPods = [...publicPods, ...myPods];
            const uniquePods = Array.from(new Map(combinedPods.map(pod => [pod._id, pod])).values());

            setAllPods(uniquePods);
        } catch (err) {
            console.error('Error fetching pods:', err);
            setError('Failed to fetch pods. Please check your network and try again.');
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchPods();
    }, [fetchPods]);

    const handlePodClick = (pod: Pod) => {
        if (currentUser) {
            const isJoined = pod.members.includes(currentUser.uid);
            onSelectPod(pod, isJoined);
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-6 flex flex-col">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Pods</h1>
                <motion.button onClick={onLogout} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors flex items-center gap-2">
                    <LogOut className="w-5 h-5" />
                    Logout
                </motion.button>
            </header>

            {loading && (
                <div className="flex items-center justify-center flex-1">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                </div>
            )}

            {error && (
                <div className="flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg my-4">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm">{error}</span>
                </div>
            )}

            {!loading && allPods.length === 0 && (
                <div className="flex flex-col items-center justify-center flex-1 text-center text-gray-500 dark:text-gray-400">
                    <p className="mb-4 text-lg">No pods found. Create one or join an existing one!</p>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
                        <PlusCircle className="w-5 h-5" />
                        Create a Pod
                    </motion.button>
                </div>
            )}

            {!loading && allPods.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
                    {allPods.map((pod) => (
                        <motion.div
                            key={pod._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer p-6 flex flex-col justify-between"
                            onClick={() => handlePodClick(pod)}
                        >
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-2">
                                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                                        {pod.name}
                                    </h2>
                                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${pod.isPrivate ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                        {pod.isPrivate ? 'Private' : 'Public'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {pod.description}
                                </p>
                            </div>
                            <div className="mt-4 text-right">
                                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                                    {pod.members.length} members
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PodsPage;
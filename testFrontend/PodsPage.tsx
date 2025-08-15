import React, { FC, useState, useEffect, Fragment, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, AlertCircle, Users, ArrowRightCircle } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { useAuth } from './App';

// ⚡ IMPORTANT: This URL must match the port of your backend server
const BASE_URL = 'http://127.0.0.1:8000';

interface Pod {
    id: string;
    name: string;
    description: string;
    memberCount: number;
    isPrivate: boolean;
    createdBy: string;
}

// **UPDATED PROPS INTERFACE**
// This component no longer needs to know about `PodDetail`
// It just needs to tell the parent which pod was selected.
interface PodsPageProps {
    onLogout: () => void;
    onSelectPod: (pod: Pod) => void;
}

const PodsPage: FC<PodsPageProps> = ({ onLogout, onSelectPod }) => {
    const { currentUser } = useAuth();
    const [pods, setPods] = useState<Pod[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPodName, setNewPodName] = useState('');
    const [newPodDescription, setNewPodDescription] = useState('');
    const [createLoading, setCreateLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!currentUser) return;

        const fetchPods = async () => {
            setLoading(true);
            try {
                const idToken = await currentUser.getIdToken();
                const response = await fetch(`${BASE_URL}/pods/my`, {
                    headers: {
                        'Authorization': `Bearer ${idToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch pods.');
                }

                const data = await response.json();
                setPods(data);
            } catch (err: any) {
                console.error('Error fetching pods:', err);
                setError(err.message || 'Failed to fetch pods. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchPods();
    }, [currentUser]);

    const handleCreatePod = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        if (newPodName.trim() === '' || !currentUser) return;
        setCreateLoading(true);

        const slug = newPodName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

        const podPayload = {
            name: newPodName,
            slug: slug,
            description: newPodDescription || undefined,
            members: [currentUser.uid],
            is_private: false,
        };

        try {
            const idToken = await currentUser.getIdToken();
            if (!idToken) throw new Error('User not authenticated.');

            const response = await fetch(`${BASE_URL}/pods/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify(podPayload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to create pod on the server.');
            }

            const newPod = await response.json();
            setPods(prevPods => [...prevPods, newPod]);
            setNewPodName('');
            setNewPodDescription('');
            setIsModalOpen(false);

        } catch (err: any) {
            console.error('Error creating pod:', err);
            setError(err.message);
        } finally {
            setCreateLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Pods</h2>
                <motion.button
                    onClick={() => setIsModalOpen(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-full shadow-md hover:bg-purple-700 transition-colors"
                >
                    <PlusCircle className="w-5 h-5" />
                    <span>New Pod</span>
                </motion.button>
            </div>

            {error && (
                <div className="flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm">{error}</span>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            ) : pods.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 p-8">
                    <p>You are not a member of any pods. Be the first to create one!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {pods.map((pod) => (
                            <motion.div
                                key={pod.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                
                                onClick={() => {
                                    console.log("Selected pod:", pod);
                                     onSelectPod(pod);
                                }}
                                className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg transition-transform flex flex-col justify-between cursor-pointer"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{pod.name}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${pod.isPrivate ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'}`}>
                                            {pod.isPrivate ? 'Private' : 'Public'}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{pod.description}</p>
                                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs">
                                        <Users className="w-4 h-4" />
                                        <span>{pod.memberCount} Members</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
            
            <Transition appear show={isModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={() => setIsModalOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
                                        Create a New Pod
                                    </Dialog.Title>
                                    {error && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mt-4">
                                            <AlertCircle className="w-5 h-5" />
                                            <span className="text-sm">{error}</span>
                                        </motion.div>
                                    )}
                                    <form onSubmit={handleCreatePod} className="mt-4 space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pod Name</label>
                                            <input
                                                type="text"
                                                value={newPodName}
                                                onChange={(e) => setNewPodName(e.target.value)}
                                                className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                                            <textarea
                                                value={newPodDescription}
                                                onChange={(e) => setNewPodDescription(e.target.value)}
                                                className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                rows={3}
                                            />
                                        </div>
                                        <div className="flex justify-end gap-2 mt-4">
                                            <motion.button
                                                type="button"
                                                onClick={() => setIsModalOpen(false)}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                disabled={createLoading}
                                                className="inline-flex justify-center rounded-lg border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none disabled:opacity-50"
                                            >
                                                Cancel
                                            </motion.button>
                                            <motion.button
                                                type="submit"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                disabled={createLoading}
                                                className="inline-flex justify-center rounded-lg border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none disabled:opacity-50"
                                            >
                                                {createLoading ? 'Creating...' : 'Create'}
                                            </motion.button>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default PodsPage;
import React, { FC, useState, useEffect, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Send, MessageSquare, Heart, Bookmark, AlertCircle, ArrowLeft, Loader2, Image as ImageIcon, X, Users, PlusCircle } from 'lucide-react';
import { useAuth } from './App';
import dayjs from 'dayjs';

const BASE_URL = 'http://127.0.0.1:8000';

interface Pod {
    _id: string;
    name: string;
    description: string;
    members: string[];
}

interface Post {
    id: string;
    podId: string;
    userId: string;
    content: string;
    createdAt: string;
    likes?: string[];
    bookmarks?: string[];
    replies?: string[];
    hashtags?: string[];
    mentions?: string[];
    slug: string;
    type: string;
    imageUrl?: string;
}

interface User {
    id: string;
    uid: string;
    displayName: string;
}

interface PostWithUser {
    post: Post;
    user: User;
}

interface PodDetailProps {
    pod: Pod | null;
    isJoined: boolean;
    onLeavePod: () => void;
    onLogout: () => void;
}

const parseContentForKeywords = (content: string) => {
    const hashtagRegex = /#(\w+)/g;
    const mentionRegex = /@(\w+)/g;

    const hashtags = content.match(hashtagRegex)?.map(tag => tag.substring(1)) || [];
    const mentions = content.match(mentionRegex)?.map(mention => mention.substring(1)) || [];

    return { hashtags, mentions };
};

const PodDetail: FC<PodDetailProps> = ({ pod, onLeavePod, isJoined: initialIsJoined, onLogout }) => {
    const { currentUser } = useAuth();
    const [posts, setPosts] = useState<PostWithUser[]>([]);
    const [newPostContent, setNewPostContent] = useState<string>('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [loadingPosts, setLoadingPosts] = useState<boolean>(true);
    const [isPosting, setIsPosting] = useState<boolean>(false);
    const [isJoining, setIsJoining] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [isMember, setIsMember] = useState<boolean>(initialIsJoined);
    const [showReplyForm, setShowReplyForm] = useState<string | null>(null);
    const [newReplyContent, setNewReplyContent] = useState('');

    if (!pod || !pod._id) {
        console.error("Pod data is missing when rendering PodDetail.");
        return (
            <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 items-center justify-center">
                <div className="flex flex-col items-center p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                    <h2 className="text-xl font-bold">Error: Pod Not Found</h2>
                    <p className="text-sm text-gray-500 mt-2">
                        The requested pod could not be loaded.
                        <br />
                        Please go back and try again.
                    </p>
                    <button onClick={onLeavePod} className="mt-6 px-4 py-2 bg-purple-600 text-white rounded-lg">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const fetchPosts = async () => {
        if (!currentUser) {
            setLoadingPosts(false);
            return;
        }

        setLoadingPosts(true);
        try {
            const idToken = await currentUser.getIdToken();
            const response = await fetch(`${BASE_URL}/posts/by_pod/${pod._id}`, {
                headers: { 'Authorization': `Bearer ${idToken}` },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch posts.');
            }

            const fetchedPosts: PostWithUser[] = await response.json();
            setPosts(fetchedPosts.reverse());

        } catch (err: unknown) {
            console.error('Error fetching posts:', err);
            if (err instanceof Error) {
                setError('Failed to fetch posts. Please try again.');
            }
        } finally {
            setLoadingPosts(false);
        }
    };

    useEffect(() => {
        setIsMember(initialIsJoined);
        if (initialIsJoined && currentUser && pod._id) {
            fetchPosts();
        } else {
            setPosts([]);
        }
    }, [initialIsJoined, pod._id, currentUser]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedImage(e.target.files[0]);
        }
    };

    const handleCreatePost = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!currentUser || !pod._id) {
            setError('Authentication or Pod data is missing. Please log in or refresh.');
            return;
        }

        if (newPostContent.trim() === '' && !selectedImage) {
            setError('Please write a post or select an image.');
            return;
        }

        setIsPosting(true);

        try {
            const idToken = await currentUser.getIdToken();
            const { hashtags, mentions } = parseContentForKeywords(newPostContent);
            const slug = newPostContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

            const formData = new FormData();
            formData.append('content', newPostContent);
            formData.append('podId', pod._id);
            formData.append('slug', slug);
            formData.append('hashtags', JSON.stringify(hashtags));
            formData.append('mentions', JSON.stringify(mentions));
            formData.append('type', selectedImage ? 'image' : 'text');
            if (selectedImage) {
                formData.append('image', selectedImage);
            }

            const response = await fetch(`${BASE_URL}/posts/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to create post.');
            }

            const newPost: PostWithUser = await response.json();
            setPosts(prev => [newPost, ...prev]);
            setNewPostContent('');
            setSelectedImage(null);

        } catch (err: unknown) {
            console.error('Error creating post:', err);
            if (err instanceof Error) {
                setError('Failed to create post. Please try again.');
            }
        } finally {
            setIsPosting(false);
        }
    };

    const handleLikePost = async (postId: string) => {
        if (!postId || !currentUser) {
            console.error("Post ID or user is missing.");
            return;
        }
        
        try {
            const idToken = await currentUser.getIdToken();
            const response = await fetch(`${BASE_URL}/posts/${postId}/like`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${idToken}` },
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to like/unlike post.');
            }
            const updatedPost: PostWithUser = await response.json();
            setPosts(prev => prev.map(p => p.post.id === updatedPost.post.id ? updatedPost : p));
        } catch (err: unknown) {
            console.error('Error liking/unliking post:', err);
            if (err instanceof Error) {
                setError('Error liking/unliking post: ' + err.message);
            }
        }
    };

    const handleBookmarkPost = async (postId: string) => {
        if (!postId || !currentUser) {
            console.error("Post ID or user is missing.");
            return;
        }

        try {
            const idToken = await currentUser.getIdToken();
            const response = await fetch(`${BASE_URL}/posts/${postId}/bookmark`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${idToken}` },
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to bookmark/unbookmark post.');
            }
            const updatedPost: PostWithUser = await response.json();
            setPosts(prev => prev.map(p => p.post.id === updatedPost.post.id ? updatedPost : p));
        } catch (err: unknown) {
            console.error('Error bookmarking/unbookmarking post:', err);
            if (err instanceof Error) {
                setError('Error bookmarking/unbookmarking post: ' + err.message);
            }
        }
    };

    const handleCreateReply = async (e: FormEvent, postId: string) => {
        e.preventDefault();
        if (!currentUser || newReplyContent.trim() === '') return;

        try {
            const idToken = await currentUser.getIdToken();
            const response = await fetch(`${BASE_URL}/replies/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                    postId: postId,
                    content: newReplyContent,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to create reply.');
            }

            const newReply = await response.json();
            setPosts(prev =>
                prev.map(p => {
                    if (p.post.id === postId) {
                        return {
                            ...p,
                            post: {
                                ...p.post,
                                replies: [...(p.post.replies || []), newReply.id],
                            },
                        };
                    }
                    return p;
                })
            );
            setNewReplyContent('');
            setShowReplyForm(null);

        } catch (err) {
            console.error('Error creating reply:', err);
            setError('Failed to create reply. Please try again.');
        }
    };


    const handleJoinPod = async () => {
        if (!currentUser || !pod._id) {
            setError('Authentication or Pod data is missing.');
            return;
        }
        setIsJoining(true);
        setError('');
        try {
            const idToken = await currentUser.getIdToken();
            const response = await fetch(`${BASE_URL}/pods/${pod._id}/join`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${idToken}` },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to join pod.');
            }

            console.log('Successfully joined pod');
            setIsMember(true);
            fetchPosts();
        } catch (err: unknown) {
            console.error('Error joining pod:', err);
            if (err instanceof Error) {
                setError('Failed to join pod: ' + err.message);
            }
        } finally {
            setIsJoining(false);
        }
    };

    const handleLeavePod = async () => {
        if (!currentUser || !pod._id) {
            setError('Authentication or Pod data is missing.');
            return;
        }
        try {
            const idToken = await currentUser.getIdToken();
            const response = await fetch(`${BASE_URL}/pods/${pod._id}/leave`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${idToken}` },
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to leave pod.');
            }
            onLeavePod();
        } catch (err: unknown) {
            console.error('Error leaving pod:', err);
            if (err instanceof Error) {
                setError('Failed to leave pod: ' + err.message);
            }
        }
    };

    const renderContent = (content: string | undefined) => {
        if (!content) return null;
        const parts = content.split(/(\s*#\w+\s*|\s*@\w+\s*)/);
        return parts.map((part, index) => {
            if (part.startsWith('#')) {
                return <a key={index} href="#" onClick={(e) => e.preventDefault()} className="text-purple-600 dark:text-purple-400 hover:underline">{part.trim()}</a>;
            }
            if (part.startsWith('@')) {
                return <a key={index} href="#" onClick={(e) => e.preventDefault()} className="text-blue-600 dark:text-blue-400 hover:underline">{part.trim()}</a>;
            }
            return <span key={index}>{part}</span>;
        });
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
            <div className="p-4 bg-white dark:bg-gray-900 shadow-md flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <motion.button onClick={onLeavePod} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </motion.button>
                    <div>
                        <h2 className="text-xl font-bold">{pod.name}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{pod.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {isMember && (
                        <motion.button onClick={handleLeavePod} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 text-sm bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full shadow-md hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors">
                            Leave Pod
                        </motion.button>
                    )}
                    <motion.button onClick={onLogout} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2 rounded-full bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                        <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </motion.button>
                </div>
            </div>
            {error && (
                <div className="flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mx-4 mt-4">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm">{error}</span>
                </div>
            )}
            {!isMember ? (
                <div className="flex flex-col flex-1 items-center justify-center text-center p-4">
                    <Users className="w-16 h-16 text-purple-500 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Join this Pod to view content</h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
                        You need to be a member of this pod to see the posts and join the conversation.
                    </p>
                    <motion.button
                        onClick={handleJoinPod}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        disabled={isJoining}
                    >
                        {isJoining ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-5 h-5" />}
                        {isJoining ? 'Joining...' : 'Join Pod'}
                    </motion.button>
                </div>
            ) : (
                <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {loadingPosts ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="text-center text-gray-500 dark:text-gray-400 p-8">
                                <p>No posts yet. Be the first to start a conversation! 🗣️</p>
                            </div>
                        ) : (
                            posts.map((postWithUser) => {
                                const { post, user } = postWithUser;
                                const likes = post.likes || [];
                                const bookmarks = post.bookmarks || [];
                                const isLiked = likes.includes(currentUser?.uid || '');
                                const formattedDate = dayjs(post.createdAt).format('MMMM D, YYYY');
                                const isBookmarked = bookmarks.includes(currentUser?.uid || '');
                                const username = user?.displayName || 'Unknown User';

                                return (
                                    <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-md">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-bold text-sm text-gray-900 dark:text-gray-100">{username}</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{formattedDate}</span>
                                        </div>

                                        {post.type === "image" && post.imageUrl ? (
                                            <>
                                                <img src={post.imageUrl} alt="Post content" className="rounded-lg w-full object-cover mb-4" />
                                                <p className="text-gray-700 dark:text-gray-300 mb-4">{renderContent(post.content)}</p>
                                            </>
                                        ) : (
                                            <p className="text-gray-700 dark:text-gray-300 mb-4">{renderContent(post.content)}</p>
                                        )}

                                        <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
                                            <motion.button className="flex items-center gap-1 cursor-pointer" whileTap={{ scale: 1.2 }} onClick={() => handleLikePost(post.id)}>
                                                <Heart className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-500'}`} />
                                                <span className="text-sm">{(post.likes || []).length}</span>
                                            </motion.button>
                                            <motion.button className="flex items-center gap-1 cursor-pointer" whileTap={{ scale: 1.2 }} onClick={() => setShowReplyForm(showReplyForm === post.id ? null : post.id)}>
                                                <MessageSquare className="w-5 h-5" />
                                                <span className="text-sm">{(post.replies || []).length}</span>
                                            </motion.button>
                                            <motion.button className="flex items-center gap-1 cursor-pointer" whileTap={{ scale: 1.2 }} onClick={() => handleBookmarkPost(post.id)}>
                                                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'text-blue-500 fill-current' : 'text-gray-500'}`} />
                                                <span className="text-sm">{(post.bookmarks || []).length}</span>
                                            </motion.button>
                                        </div>
                                        {showReplyForm === post.id && (
                                            <form onSubmit={(e) => handleCreateReply(e, post.id)} className="flex items-center gap-2 mt-4">
                                                <input
                                                    type="text"
                                                    value={newReplyContent}
                                                    onChange={(e) => setNewReplyContent(e.target.value)}
                                                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-gray-100"
                                                    placeholder="Write a reply..."
                                                />
                                                <motion.button
                                                    type="submit"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="p-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                                                >
                                                    <Send className="w-5 h-5" />
                                                </motion.button>
                                            </form>
                                        )}
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                    <form onSubmit={handleCreatePost} className="p-4 bg-white dark:bg-gray-900 shadow-lg flex flex-col gap-2">
                        <textarea
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            className="flex-1 w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-gray-100 resize-none"
                            placeholder="Create a new post... (use #hashtags and @mentions)"
                            rows={2}
                            disabled={isPosting}
                        />

                        {selectedImage && (
                            <div className="relative mt-2">
                                <img
                                    src={URL.createObjectURL(selectedImage)}
                                    alt="Preview"
                                    className="w-full h-auto max-h-48 object-cover rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={() => setSelectedImage(null)}
                                    className="absolute top-2 right-2 p-1 rounded-full bg-black bg-opacity-50 text-white"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        <div className="flex items-center gap-2 mt-2">
                            <label htmlFor="image-upload" className="cursor-pointer p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                <ImageIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                <input
                                    id="image-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                    disabled={isPosting}
                                />
                            </label>

                            <motion.button
                                type="submit"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-full shadow-md hover:bg-purple-700 transition-colors disabled:opacity-50"
                                disabled={isPosting || (newPostContent.trim() === '' && !selectedImage)}
                            >
                                {isPosting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : <div className="flex items-center justify-center gap-2"><Send className="w-5 h-5" /> Post</div>}
                            </motion.button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
};

export default PodDetail;
import React, { FC, useState, useEffect, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Send, MessageSquare, Heart, Bookmark, AlertCircle, ArrowLeft, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { useAuth } from './App';
import dayjs from 'dayjs';

const BASE_URL = 'http://127.0.0.1:8000';

interface Pod {
    _id: string;
    name: string;
    description: string;
}

interface Post {
    id: string;
    podId: string;
    userId: string;
    content: string;
    createdAt: string;
    likes: string[];
    bookmarks: string[];
    replies: string[];
    hashtags: string[];
    mentions: string[];
    slug: string;
    type: string;
    imageUrl?: string;
}

interface PodDetailProps {
    pod: Pod | null;
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

const uploadImageToCloud = async (imageFile: File): Promise<string> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const tempUrl = `https://picsum.photos/800/600?random=${Math.random()}`;
            console.log(`Simulated image upload. URL: ${tempUrl}`);
            resolve(tempUrl);
        }, 1500);
    });
};

const PodDetail: FC<PodDetailProps> = ({ pod, onLeavePod, onLogout }) => {
    const { currentUser } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [isPosting, setIsPosting] = useState(false);
    const [error, setError] = useState('');
    const [usernames, setUsernames] = useState<{ [uid: string]: string }>({});

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

    const fetchUsernames = async (userIds: string[]) => {
        if (!currentUser) return;
        const uniqueUserIds = [...new Set(userIds)];
        const usersToFetch = uniqueUserIds.filter(id => id && !usernames[id]);

        if (usersToFetch.length === 0) return;

        try {
            const idToken = await currentUser.getIdToken();
            const fetchPromises = usersToFetch.map(userId =>
                fetch(`${BASE_URL}/users/${userId}`, { headers: { 'Authorization': `Bearer ${idToken}` } })
            );

            const responses = await Promise.all(fetchPromises);
            const data = await Promise.all(responses.map(res => {
                if (!res.ok) {
                    console.error(`Failed to fetch user ${res.url}. Status: ${res.status}`);
                    return { uid: res.url.split('/').pop(), displayName: 'Unknown User' };
                }
                return res.json();
            }));

            const newUsers = data.reduce((acc, userData) => {
                acc[userData.uid] = userData.displayName;
                return acc;
            }, {} as { [uid: string]: string });
            
            setUsernames(prev => ({ ...prev, ...newUsers }));
        } catch (err: unknown) {
            console.error("Error fetching usernames:", err);
        }
    };

    useEffect(() => {
        if (!currentUser || !pod._id) {
            setLoadingPosts(false);
            return;
        }

        const fetchPosts = async () => {
            setLoadingPosts(true);
            try {
                const idToken = await currentUser.getIdToken();
                const response = await fetch(`${BASE_URL}/posts/by_pod/${pod._id}`, {
                    headers: { 'Authorization': `Bearer ${idToken}` },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch posts.');
                }
                
                const fetchedPosts = await response.json();
                
                // Filter out any posts that are missing an 'id' or other key fields
                const validPosts = fetchedPosts.filter((post: Post) => post.id && post.createdAt);
                setPosts(validPosts.reverse());

                const allUserIds = validPosts.flatMap((post: Post) => [post.userId, ...(post.likes || []), ...(post.replies || [])]);
                await fetchUsernames(allUserIds);

            } catch (err: unknown) {
                console.error('Error fetching posts:', err);
                if (err instanceof Error) {
                    setError('Failed to fetch posts. Please try again.');
                }
            } finally {
                setLoadingPosts(false);
            }
        };

        fetchPosts();
    }, [pod._id, currentUser]);

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

            let postType = 'text';
            let imageUrl: string | undefined = undefined;

            if (selectedImage) {
                postType = 'image';
                imageUrl = await uploadImageToCloud(selectedImage);
            }

            const postPayload = {
                podId: pod._id,
                content: newPostContent,
                hashtags: hashtags,
                mentions: mentions,
                slug: slug,
                type: postType,
                imageUrl: imageUrl,
            };
            
            const response = await fetch(`${BASE_URL}/posts/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify(postPayload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to create post.');
            }

            const newPost = await response.json();
            setPosts(prev => [newPost, ...prev]);
            setNewPostContent('');
            setSelectedImage(null);
            
            await fetchUsernames([newPost.userId, ...(newPost.likes || [])]);
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
        if (!currentUser) return;
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
            const updatedPost = await response.json();
            setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
        } catch (err: unknown) {
            console.error('Error liking/unliking post:', err);
            if (err instanceof Error) {
                setError('Error liking/unliking post: ' + err.message);
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
                <motion.button onClick={onLogout} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2 rounded-full bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                    <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
                </motion.button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {error && (
                    <div className="flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg">
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm">{error}</span>
                    </div>
                )}
                {loadingPosts ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 p-8">
                        <p>No posts yet. Be the first to start a conversation! 🗣️</p>
                    </div>
                ) : (
                    posts.map((post) => {
                        const likes = post.likes || [];
                        const bookmarks = post.bookmarks || [];
                        const isLiked = likes.includes(currentUser?.uid || '');

                        const formattedDate = dayjs(post.createdAt).format('MMMM D, YYYY');

                        return (
                            <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-md">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-sm text-gray-900 dark:text-gray-100">{usernames[post.userId] || 'Loading...'}</span>
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
                                    <div className="flex items-center gap-1">
                                        <motion.button whileTap={{ scale: 1.2 }} onClick={() => post.id && handleLikePost(post.id)}>
                                            <Heart className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-500'}`} />
                                        </motion.button>
                                        <span className="text-sm">{likes.length}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Bookmark className="w-5 h-5" />
                                        <span className="text-sm">{bookmarks.length}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MessageSquare className="w-5 h-5" />
                                        <span className="text-sm">0</span>
                                    </div>
                                </div>
                                {((post.hashtags && post.hashtags.length > 0) || (post.mentions && post.mentions.length > 0)) && (
                                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        {post.hashtags && post.hashtags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1">{post.hashtags.map((tag, index) => (<span key={index} className="px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">#{tag}</span>))}</div>
                                        )}
                                        {post.mentions && post.mentions.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1">{post.mentions.map((mention, index) => (<span key={index} className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">@{mention}</span>))}</div>
                                        )}
                                    </div>
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
        </div>
    );
};

export default PodDetail;
import axios from 'axios';
// import { auth } from './firebase'; // Ensure correct type import

// If you have a firebase.ts file, export 'auth' with its type, e.g.:
// import { Auth } from 'firebase/auth';
// export const auth: Auth = getAuth(app);

// Then, import with type:
import type { Auth } from 'firebase/auth';
declare const auth: Auth;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://earnbuddy-g88i.onrender.com',
  timeout: 5000, // 5 second timeout
});

// Add authentication interceptor
api.interceptors.request.use(
  async (config) => {
    // Get the current user
    const user = auth.currentUser;
    if (user) {
      try {
        // Get the Firebase ID token
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error('Error getting Firebase token:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Simple error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Community Posts API
export const communityPostsAPI = {
  // Create a new community post
  createPost: async (postData: {
    content: string;
    selectedPod?: string;
    images?: string[];
    documents?: Array<{
      url: string;
      name: string;
      type: string;
      size: string;
    }>;
    emoji?: string;
    tags?: string[];
    userName?: string;
    userAvatar?: string;
    userId?: string;
  }) => {
    // Don't send auth headers, pass user info directly
    const response = await axios.post(`${import.meta.env.VITE_API_URL || 'https://earnbuddy-g88i.onrender.com'}/api/posts/community-posts`, postData);
    return response.data;
  },

  // Get all community posts
  getPosts: async (params?: {
    skip?: number;
    limit?: number;
    pod_filter?: string;
  }) => {
    // Don't send auth headers for getting posts (they're public)
    const response = await axios.get(`${import.meta.env.VITE_API_URL || 'https://earnbuddy-g88i.onrender.com'}/api/posts/community-posts`, { params });
    return response.data;
  },

  // Like/unlike a community post
  likePost: async (postId: string) => {
    // Don't send auth headers for likes (temporarily)
    const response = await axios.post(`${import.meta.env.VITE_API_URL || 'https://earnbuddy-g88i.onrender.com'}/api/posts/community-posts/${postId}/like`);
    return response.data;
  }
};

// Room messaging API
export const roomMessagesAPI = {
  // Send a room message
  sendMessage: async (messageData: {
    roomId: string;
    content: string;
    senderId: string;
    senderName: string;
    senderAvatar: string;
    type?: string;
    attachment?: any;
  }) => {
    const response = await axios.post(`${import.meta.env.VITE_API_URL || 'https://earnbuddy-g88i.onrender.com'}/api/messages/room`, messageData);
    return response.data;
  },

  // Get room messages
  getMessages: async (roomId: string, params?: {
    skip?: number;
    limit?: number;
  }) => {
    const response = await axios.get(`${import.meta.env.VITE_API_URL || 'https://earnbuddy-g88i.onrender.com'}/api/messages/room/${roomId}`, { params });
    return response.data;
  }
};

// Upload API
export const uploadAPI = {
  uploadFile: async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    const base = import.meta.env.VITE_API_URL || 'https://earnbuddy-g88i.onrender.com';
    const response = await api.post(`${base}/api/upload`, form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};

export default api;
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  Image as ImageIcon,
  FileText,
  Smile,
  Paperclip,
  Video,
  Music,
  MapPin,
  Calendar,
  Hash,
  Globe,
  Users,
  Zap,
  Heart,
  Star,
  ThumbsUp,
  Rocket,
  Code,
  Palette,
  DollarSign,
  Leaf,
  Cpu
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePods } from '../hooks/useFirestore';
import { FirestoreService } from '../lib/firestore';

interface CommunityPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface PostData {
  content: string;
  selectedPod?: string;
  images: File[];
  documents: File[];
  emoji?: string;
  tags: string[];
}

const CommunityPostModal: React.FC<CommunityPostModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { currentUser } = useAuth();
  const { pods } = usePods();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postData, setPostData] = useState<PostData>({
    content: '',
    images: [],
    documents: [],
    tags: []
  });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showPodSelector, setShowPodSelector] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const emojis = [
    { emoji: '❤️', name: 'heart' },
    { emoji: '🚀', name: 'rocket' },
    { emoji: '💡', name: 'bulb' },
    { emoji: '🔥', name: 'fire' },
    { emoji: '⭐', name: 'star' },
    { emoji: '👍', name: 'thumbsup' },
    { emoji: '🎉', name: 'party' },
    { emoji: '💪', name: 'muscle' },
    { emoji: '🎯', name: 'target' },
    { emoji: '⚡', name: 'zap' },
    { emoji: '💻', name: 'computer' },
    { emoji: '🎨', name: 'art' },
    { emoji: '💰', name: 'money' },
    { emoji: '🌱', name: 'plant' },
    { emoji: '🤖', name: 'robot' },
    { emoji: '🌐', name: 'globe' }
  ];

  const handleContentChange = (value: string) => {
    setPostData(prev => ({ ...prev, content: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length + postData.images.length > 4) {
      alert('You can only upload up to 4 images');
      return;
    }

    setPostData(prev => ({
      ...prev,
      images: [...prev.images, ...imageFiles]
    }));
  };

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const documentFiles = files.filter(file =>
      file.type.includes('pdf') ||
      file.type.includes('doc') ||
      file.type.includes('txt') ||
      file.type.includes('md')
    );

    if (documentFiles.length + postData.documents.length > 3) {
      alert('You can only upload up to 3 documents');
      return;
    }

    setPostData(prev => ({
      ...prev,
      documents: [...prev.documents, ...documentFiles]
    }));
  };

  const removeImage = (index: number) => {
    setPostData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const removeDocument = (index: number) => {
    setPostData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const addEmoji = (emoji: string) => {
    setPostData(prev => ({ ...prev, emoji: emoji }));
    setShowEmojiPicker(false);
  };

  const addTag = (tag: string) => {
    if (!postData.tags.includes(tag)) {
      setPostData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setPostData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

    const handleSubmit = async () => {
    if (!currentUser || !postData.content.trim()) return;

    try {
      setIsSubmitting(true);

      // Upload images and documents to storage (simplified for now)
      const imageUrls: string[] = [];
      const documents: Array<{
        url: string;
        name: string;
        type: string;
        size: string;
      }> = [];

      // TODO: Implement actual file upload to Firebase Storage
      // For now, we'll simulate the upload process
      for (const image of postData.images) {
        // Simulate image upload
        const imageUrl = URL.createObjectURL(image);
        imageUrls.push(imageUrl);
      }

      for (const doc of postData.documents) {
        // Simulate document upload
        documents.push({
          url: URL.createObjectURL(doc),
          name: doc.name,
          type: doc.type,
          size: `${(doc.size / 1024).toFixed(1)} KB`
        });
      }

      // Create the post - use localStorage for now to ensure it works
      const localPost = {
        id: `local_${Date.now()}`,
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Anonymous User',
        userAvatar: currentUser.photoURL || undefined,
        content: postData.content,
        podId: postData.selectedPod || 'community',
        type: 'text',
        imageUrl: imageUrls[0],
        images: imageUrls,
        documents: documents,
        emoji: postData.emoji,
        tags: postData.tags || [],
        likes: [],
        comments: [],
        bookmarks: [],
        reactions: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Store in localStorage
      const existingPosts = JSON.parse(localStorage.getItem('localCommunityPosts') || '[]');
      existingPosts.unshift(localPost);
      localStorage.setItem('localCommunityPosts', JSON.stringify(existingPosts));

      // Try Firestore as well (but don't fail if it doesn't work)
      try {
        await FirestoreService.createCommunityPost({
          userId: currentUser.uid,
          userName: currentUser.displayName || 'Anonymous User',
          userAvatar: currentUser.photoURL || undefined,
          content: postData.content,
          selectedPod: postData.selectedPod,
          images: imageUrls,
          documents: documents,
          emoji: postData.emoji,
          tags: postData.tags
        });
        console.log('Post also saved to Firestore');
      } catch (firestoreError) {
        console.error('Firestore error (non-critical):', firestoreError);
      }

      onSuccess();
      onClose();

      // Reset form
      setPostData({
        content: '',
        images: [],
        documents: [],
        tags: []
      });
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = postData.content.trim().length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Post</h2>
                <p className="text-gray-600 dark:text-gray-400">Share with the builder community</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3 mb-6">
              <img
                src={currentUser?.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"}
                alt="Your avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {currentUser?.displayName || 'Anonymous User'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {postData.selectedPod ? `Posting to ${postData.selectedPod}` : 'Posting to community'}
                </p>
              </div>
            </div>

            {/* Post Content */}
            <div className="space-y-4">
              <div>
                <textarea
                  value={postData.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="What's happening in the builder community?"
                  className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg min-h-[120px]"
                />
              </div>

              {/* Emoji Display */}
              {postData.emoji && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{postData.emoji}</span>
                  <button
                    onClick={() => setPostData(prev => ({ ...prev, emoji: undefined }))}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Tags Display */}
              {postData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {postData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm flex items-center gap-2"
                    >
                      #{tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:text-emerald-900 dark:hover:text-emerald-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Images Preview */}
              {postData.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {postData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Documents Preview */}
              {postData.documents.length > 0 && (
                <div className="space-y-2">
                  {postData.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{doc.name}</span>
                      </div>
                      <button
                        onClick={() => removeDocument(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  {/* Image Upload */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Add image"
                  >
                    <ImageIcon className="w-5 h-5 text-gray-500" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  {/* Document Upload */}
                  <button
                    onClick={() => documentInputRef.current?.click()}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Add document"
                  >
                    <FileText className="w-5 h-5 text-gray-500" />
                  </button>
                  <input
                    ref={documentInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.md"
                    multiple
                    onChange={handleDocumentUpload}
                    className="hidden"
                  />

                  {/* Emoji Picker */}
                  <div className="relative">
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      title="Add emoji"
                    >
                      <Smile className="w-5 h-5 text-gray-500" />
                    </button>

                    <AnimatePresence>
                      {showEmojiPicker && (
                        <motion.div
                          className="absolute bottom-full left-0 mb-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 grid grid-cols-8 gap-1 z-10"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                        >
                          {emojis.map((emoji, index) => (
                            <button
                              key={index}
                              onClick={() => addEmoji(emoji.emoji)}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-lg"
                              title={emoji.name}
                            >
                              {emoji.emoji}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Pod Selector */}
                  <div className="relative">
                    <button
                      onClick={() => setShowPodSelector(!showPodSelector)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      title="Select pod"
                    >
                      <Hash className="w-5 h-5 text-gray-500" />
                    </button>

                    <AnimatePresence>
                      {showPodSelector && (
                        <motion.div
                          className="absolute bottom-full left-0 mb-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto z-10"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                        >
                          <div className="space-y-1">
                            <button
                              onClick={() => {
                                setPostData(prev => ({ ...prev, selectedPod: undefined }));
                                setShowPodSelector(false);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm"
                            >
                              Community
                            </button>
                            {pods.map((pod) => (
                              <button
                                key={pod.id}
                                onClick={() => {
                                  setPostData(prev => ({ ...prev, selectedPod: pod.name }));
                                  setShowPodSelector(false);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm"
                              >
                                {pod.name}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">
                    {postData.content.length}/500
                  </span>
                  <motion.button
                    onClick={handleSubmit}
                    disabled={!canSubmit || isSubmitting}
                    className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                      canSubmit && !isSubmitting
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                    }`}
                    whileHover={{ scale: canSubmit && !isSubmitting ? 1.02 : 1 }}
                    whileTap={{ scale: canSubmit && !isSubmitting ? 0.98 : 1 }}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Post
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommunityPostModal;
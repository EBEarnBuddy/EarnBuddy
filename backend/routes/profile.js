import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Project from '../models/Project.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { firebaseAuthMiddleware } from '../middleware/firebaseAuth.js';

const router = express.Router();

// Get user profile (protected route)
router.get('/', firebaseAuthMiddleware, asyncHandler(async (req, res) => {
  const user = req.user;

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        firstName: user.firstName,
        lastName: user.lastName,
        photoURL: user.photoURL,
        bio: user.bio,
        location: user.location,
        website: user.website,
        github: user.github,
        linkedin: user.linkedin,
        twitter: user.twitter,
        skills: user.skills,
        interests: user.interests,
        experience: user.experience,
        role: user.role,
        availability: user.availability,
        hourlyRate: user.hourlyRate,
        currency: user.currency,
        rating: user.rating,
        totalRatings: user.totalRatings,
        averageRating: user.averageRating,
        completedProjects: user.completedProjects,
        totalEarnings: user.totalEarnings,
        profileViews: user.profileViews,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
        isVerified: user.isVerified,
        onboardingCompleted: user.onboardingCompleted,
        onboardingData: user.onboardingData,
        joinedPods: user.joinedPods,
        joinedRooms: user.joinedRooms,
        postedStartups: user.postedStartups,
        postedGigs: user.postedGigs,
        appliedGigs: user.appliedGigs,
        appliedStartups: user.appliedStartups,
        bookmarkedGigs: user.bookmarkedGigs,
        bookmarkedStartups: user.bookmarkedStartups,
        activityLog: user.activityLog,
        badges: user.badges,
        preferences: user.preferences,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }
  });
}));

// Update profile
router.put('/', [
  body('displayName').optional().trim().isLength({ min: 2, max: 50 }),
  body('firstName').optional().trim().isLength({ max: 30 }),
  body('lastName').optional().trim().isLength({ max: 30 }),
  body('bio').optional().trim().isLength({ max: 500 }),
  body('location').optional().trim().isLength({ max: 100 }),
  body('website').optional().isURL(),
  body('github').optional().isURL(),
  body('linkedin').optional().isURL(),
  body('twitter').optional().isURL(),
  body('experience').optional().isIn(['beginner', 'intermediate', 'expert']),
  body('role').optional().isIn(['freelancer', 'founder', 'builder', 'investor', 'student']),
  body('availability').optional().isIn(['full-time', 'part-time', 'weekends', 'flexible']),
  body('hourlyRate').optional().isNumeric(),
  body('currency').optional().isLength({ min: 3, max: 3 })
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const updateFields = req.body;
  const user = req.user;

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Update fields
  Object.keys(updateFields).forEach(key => {
    if (updateFields[key] !== undefined) {
      user[key] = updateFields[key];
    }
  });

  await user.save();
  await user.addActivity('profile_updated', 'Profile information updated');

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user._id,
        displayName: user.displayName,
        firstName: user.firstName,
        lastName: user.lastName,
        photoURL: user.photoURL,
        bio: user.bio,
        location: user.location,
        website: user.website,
        github: user.github,
        linkedin: user.linkedin,
        twitter: user.twitter,
        experience: user.experience,
        role: user.role,
        availability: user.availability,
        hourlyRate: user.hourlyRate,
        currency: user.currency
      }
    }
  });
}));

// Update profile photo
router.put('/photo', [
  body('photoURL').isURL()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { photoURL } = req.body;
  const user = req.user;

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  user.photoURL = photoURL;
  await user.save();
  await user.addActivity('photo_updated', 'Profile photo updated');

  res.json({
    success: true,
    message: 'Profile photo updated successfully',
    data: {
      photoURL: user.photoURL
    }
  });
}));

// Update skills
router.put('/skills', [
  body('skills').isArray({ min: 0, max: 20 }),
  body('skills.*').isString().trim().isLength({ min: 1, max: 50 })
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { skills } = req.body;
  const user = req.user;

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  user.skills = skills;
  await user.save();
  await user.addActivity('skills_updated', `Skills updated: ${skills.join(', ')}`);

  res.json({
    success: true,
    message: 'Skills updated successfully',
    data: {
      skills: user.skills
    }
  });
}));

// Update interests
router.put('/interests', [
  body('interests').isArray({ min: 0, max: 20 }),
  body('interests.*').isString().trim().isLength({ min: 1, max: 50 })
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { interests } = req.body;
  const user = req.user;

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  user.interests = interests;
  await user.save();
  await user.addActivity('interests_updated', `Interests updated: ${interests.join(', ')}`);

  res.json({
    success: true,
    message: 'Interests updated successfully',
    data: {
      interests: user.interests
    }
  });
}));

// Update preferences
router.put('/preferences', [
  body('preferences').isObject()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { preferences } = req.body;
  const user = req.user;

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  user.preferences = { ...user.preferences, ...preferences };
  await user.save();
  await user.addActivity('preferences_updated', 'User preferences updated');

  res.json({
    success: true,
    message: 'Preferences updated successfully',
    data: {
      preferences: user.preferences
    }
  });
}));

// Complete onboarding
router.post('/onboarding', [
  body('onboardingData').isObject()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { onboardingData } = req.body;
  const user = req.user;

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  user.onboardingData = onboardingData;
  user.onboardingCompleted = true;

  // Update profile with onboarding data
  if (onboardingData.role) user.role = onboardingData.role;
  if (onboardingData.experience) user.experience = onboardingData.experience;
  if (onboardingData.interests) user.interests = onboardingData.interests;
  if (onboardingData.skills) user.skills = onboardingData.skills;
  if (onboardingData.location) user.location = onboardingData.location;
  if (onboardingData.availability) user.availability = onboardingData.availability;

  await user.save();
  await user.addActivity('onboarding_completed', 'User completed onboarding process');

  res.json({
    success: true,
    message: 'Onboarding completed successfully',
    data: {
      onboardingCompleted: user.onboardingCompleted,
      onboardingData: user.onboardingData
    }
  });
}));

// Get user analytics (protected route)
router.get('/analytics', firebaseAuthMiddleware, asyncHandler(async (req, res) => {
  const user = req.user;

  // Get actual project counts from the database
  const projectsCreated = await Project.countDocuments({ owner: user._id });
  const projectsApplied = await Project.countDocuments({
    'roles.applicants.userId': user._id
  });
  const projectsBookmarked = await Project.countDocuments({
    bookmarks: user._id
  });

  const analytics = {
    profileViews: user.profileViews,
    postsCreated: user.activityLog.filter(activity =>
      activity.action === 'post_created'
    ).length,
    messagesPosted: user.activityLog.filter(activity =>
      activity.action === 'message_sent'
    ).length,
    podsJoined: user.joinedPods.length,
    gigsApplied: user.appliedGigs.length,
    startupsApplied: user.appliedStartups.length,
    projectsCreated: projectsCreated,
    projectsApplied: projectsApplied,
    projectsBookmarked: projectsBookmarked,
    completedProjects: user.completedProjects,
    earnings: user.totalEarnings,
    lastActive: user.lastSeen,
    rating: user.rating,
    totalRatings: user.totalRatings,
    averageRating: user.averageRating
  };

  res.json({
    success: true,
    data: { analytics }
  });
}));

// Get recent activity (protected route)
router.get('/activity', firebaseAuthMiddleware, asyncHandler(async (req, res) => {
  const user = req.user;
  const { limit = 10 } = req.query;

  const activities = user.activityLog
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, parseInt(limit));

  res.json({
    success: true,
    data: { activities }
  });
}));

// Search users
router.get('/search', asyncHandler(async (req, res) => {
  const { q, skills, location, role, experience } = req.query;
  const { limit = 20, page = 1 } = req.query;

  let query = { isActive: true };

  // Text search
  if (q) {
    query.$text = { $search: q };
  }

  // Filter by skills
  if (skills) {
    const skillsArray = skills.split(',').map(s => s.trim());
    query.skills = { $in: skillsArray };
  }

  // Filter by location
  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }

  // Filter by role
  if (role) {
    query.role = role;
  }

  // Filter by experience
  if (experience) {
    query.experience = experience;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const users = await User.find(query)
    .select('displayName photoURL bio location skills role experience rating completedProjects')
    .sort({ rating: -1, profileViews: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
}));

// Get online users
router.get('/online', asyncHandler(async (req, res) => {
  const { limit = 50 } = req.query;

  const users = await User.findOnlineUsers()
    .limit(parseInt(limit))
    .sort({ lastSeen: -1 });

  res.json({
    success: true,
    data: { users }
  });
}));

// Get users by skills
router.get('/by-skills/:skills', asyncHandler(async (req, res) => {
  const { skills } = req.params;
  const skillsArray = skills.split(',').map(s => s.trim());
  const { limit = 20 } = req.query;

  const users = await User.findBySkills(skillsArray)
    .limit(parseInt(limit))
    .sort({ rating: -1 });

  res.json({
    success: true,
    data: { users }
  });
}));

export default router;
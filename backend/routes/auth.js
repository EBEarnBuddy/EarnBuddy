import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Register user
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('displayName').trim().isLength({ min: 2, max: 50 }),
  body('firstName').optional().trim().isLength({ max: 30 }),
  body('lastName').optional().trim().isLength({ max: 30 })
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { email, password, displayName, firstName, lastName } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    });
  }

  // Create new user
  const user = new User({
    email,
    password,
    displayName,
    firstName,
    lastName
  });

  await user.save();

  // Generate token
  const token = generateToken(user._id);

  // Add activity log
  await user.addActivity('account_created', 'Account created successfully');

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        firstName: user.firstName,
        lastName: user.lastName,
        photoURL: user.photoURL,
        onboardingCompleted: user.onboardingCompleted
      },
      token
    }
  });
}));

// Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { email, password } = req.body;

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check if account is active
  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Account is deactivated'
    });
  }

  // Update last seen and online status
  await user.updateLastSeen();

  // Generate token
  const token = generateToken(user._id);

  // Add activity log
  await user.addActivity('login', 'User logged in successfully');

  res.json({
    success: true,
    message: 'Login successful',
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
        skills: user.skills,
        interests: user.interests,
        rating: user.rating,
        completedProjects: user.completedProjects,
        totalEarnings: user.totalEarnings,
        onboardingCompleted: user.onboardingCompleted,
        preferences: user.preferences
      },
      token
    }
  });
}));

// Google OAuth login/register
router.post('/google', [
  body('googleId').notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('displayName').trim().isLength({ min: 2, max: 50 }),
  body('photoURL').optional().isURL()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { googleId, email, displayName, photoURL, firstName, lastName } = req.body;

  // Check if user exists with Google ID
  let user = await User.findOne({ googleId });

  if (!user) {
    // Check if user exists with email
    user = await User.findOne({ email });

    if (user) {
      // Link Google account to existing email account
      user.googleId = googleId;
      if (photoURL) user.photoURL = photoURL;
      await user.save();
    } else {
      // Create new user
      user = new User({
        googleId,
        email,
        displayName,
        photoURL,
        firstName,
        lastName,
        isVerified: true // Google accounts are pre-verified
      });
      await user.save();
      await user.addActivity('account_created', 'Account created via Google OAuth');
    }
  }

  // Update last seen and online status
  await user.updateLastSeen();

  // Generate token
  const token = generateToken(user._id);

  // Add activity log
  await user.addActivity('login', 'User logged in via Google OAuth');

  res.json({
    success: true,
    message: 'Google authentication successful',
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
        skills: user.skills,
        interests: user.interests,
        rating: user.rating,
        completedProjects: user.completedProjects,
        totalEarnings: user.totalEarnings,
        onboardingCompleted: user.onboardingCompleted,
        preferences: user.preferences
      },
      token
    }
  });
}));

// Get current user
router.get('/me', asyncHandler(async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  const jwt = await import('jsonwebtoken');
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.userId).select('-password');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'User not found'
    });
  }

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
        skills: user.skills,
        interests: user.interests,
        rating: user.rating,
        completedProjects: user.completedProjects,
        totalEarnings: user.totalEarnings,
        onboardingCompleted: user.onboardingCompleted,
        preferences: user.preferences
      }
    }
  });
}));

// Logout (client-side token removal, but we can track it)
router.post('/logout', asyncHandler(async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (token) {
    try {
      const jwt = await import('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (user) {
        user.isOnline = false;
        user.lastSeen = new Date();
        await user.save();
        await user.addActivity('logout', 'User logged out');
      }
    } catch (error) {
      // Token might be invalid, but that's okay for logout
    }
  }

  res.json({
    success: true,
    message: 'Logout successful'
  });
}));

export default router;
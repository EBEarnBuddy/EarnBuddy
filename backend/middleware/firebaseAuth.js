import admin from 'firebase-admin';
import User from '../models/User.js';

// Initialize Firebase Admin (you'll need to add your service account key)
// For development, we'll use a simple approach without service account
let firebaseApp;

try {
  // Try to initialize Firebase Admin if service account is available
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    // TODO: Implement proper Firebase authentication
    console.log('Firebase Admin not configured, using development mode');
  }
} catch (error) {
  console.log('Firebase Admin initialization failed, using development mode:', error.message);
}

export const firebaseAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    let decodedToken;

    if (firebaseApp) {
      // Verify Firebase token
      try {
        decodedToken = await admin.auth().verifyIdToken(token);
      } catch (firebaseError) {
        console.error('Firebase token verification failed:', firebaseError);
        return res.status(401).json({
          success: false,
          message: 'Invalid Firebase token.'
        });
      }
    } else {
      // Development mode - accept any token for now
      console.log('Development mode: accepting token without verification');
      decodedToken = { uid: 'dev-user-id', email: 'dev@example.com' };
    }

    // Find or create user in our database
    let user = await User.findOne({ email: decodedToken.email });

    if (!user) {
      // Create a new user if they don't exist
      user = new User({
        email: decodedToken.email,
        displayName: decodedToken.name || decodedToken.email.split('@')[0],
        photoURL: decodedToken.picture || '',
        firebaseUid: decodedToken.uid,
        isActive: true,
        onboardingCompleted: false
      });
      await user.save();
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.'
      });
    }

    // Update last seen
    await user.updateLastSeen();

    req.user = user;
    next();
  } catch (error) {
    console.error('Firebase auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};

export const optionalFirebaseAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      let decodedToken;

      if (firebaseApp) {
        try {
          decodedToken = await admin.auth().verifyIdToken(token);
        } catch (firebaseError) {
          console.error('Firebase token verification failed:', firebaseError);
          return next();
        }
      } else {
        // Development mode
        decodedToken = { uid: 'dev-user-id', email: 'dev@example.com' };
      }

      let user = await User.findOne({ email: decodedToken.email });

      if (user && user.isActive) {
        await user.updateLastSeen();
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication for optional routes
    next();
  }
};
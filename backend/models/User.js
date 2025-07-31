import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Basic authentication info
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() { return !this.googleId && !this.firebaseUid; }, // Only required if not Google auth or Firebase auth
    minlength: 6
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  firebaseUid: {
    type: String,
    sparse: true,
    unique: true
  },

  // Profile information
  displayName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: 30
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: 30
  },
  photoURL: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  location: {
    type: String,
    maxlength: 100,
    default: ''
  },
  website: {
    type: String,
    maxlength: 200
  },
  github: {
    type: String,
    maxlength: 200
  },
  linkedin: {
    type: String,
    maxlength: 200
  },
  twitter: {
    type: String,
    maxlength: 200
  },

  // Skills and interests
  skills: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  interests: [{
    type: String,
    trim: true,
    maxlength: 50
  }],

  // Professional information
  experience: {
    type: String,
    enum: ['beginner', 'intermediate', 'expert'],
    default: 'beginner'
  },
  role: {
    type: String,
    enum: ['freelancer', 'founder', 'builder', 'investor', 'student'],
    default: 'builder'
  },
  availability: {
    type: String,
    enum: ['full-time', 'part-time', 'weekends', 'flexible'],
    default: 'flexible'
  },
  hourlyRate: {
    type: Number,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },

  // Statistics and achievements
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  completedProjects: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  profileViews: {
    type: Number,
    default: 0
  },

  // Community participation
  joinedPods: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pod'
  }],
  joinedRooms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  }],
  postedStartups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Startup'
  }],
  postedGigs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig'
  }],
  appliedGigs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig'
  }],
  appliedStartups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Startup'
  }],
  bookmarkedGigs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig'
  }],
  bookmarkedStartups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Startup'
  }],

  // Activity and status
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },

  // Onboarding
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  onboardingData: {
    role: String,
    experience: String,
    interests: [String],
    skills: [String],
    goals: [String],
    availability: String,
    budget: String,
    location: String,
    remote: Boolean
  },

  // Activity log
  activityLog: [{
    action: {
      type: String,
      required: true
    },
    description: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: mongoose.Schema.Types.Mixed
  }],

  // Badges and achievements
  badges: [{
    name: String,
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Preferences
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: true
    },
    profileVisibility: {
      type: String,
      enum: ['public', 'private', 'connections'],
      default: 'public'
    },
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.displayName;
});

// Virtual for average rating
userSchema.virtual('averageRating').get(function() {
  if (this.totalRatings === 0) return 0;
  return (this.rating / this.totalRatings).toFixed(1);
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ displayName: 'text', bio: 'text', skills: 'text' });
userSchema.index({ location: 1 });
userSchema.index({ skills: 1 });
userSchema.index({ isOnline: 1, lastSeen: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to update last seen
userSchema.methods.updateLastSeen = function() {
  this.lastSeen = new Date();
  this.isOnline = true;
  return this.save();
};

// Method to add activity log entry
userSchema.methods.addActivity = function(action, description, metadata = {}) {
  this.activityLog.push({
    action,
    description,
    metadata,
    timestamp: new Date()
  });

  // Keep only last 100 activities
  if (this.activityLog.length > 100) {
    this.activityLog = this.activityLog.slice(-100);
  }

  return this.save();
};

// Method to add badge
userSchema.methods.addBadge = function(name, description) {
  const existingBadge = this.badges.find(badge => badge.name === name);
  if (!existingBadge) {
    this.badges.push({
      name,
      description,
      earnedAt: new Date()
    });
    return this.save();
  }
  return Promise.resolve(this);
};

// Static method to find users by skills
userSchema.statics.findBySkills = function(skills) {
  return this.find({
    skills: { $in: skills },
    isActive: true
  }).select('displayName photoURL skills location rating');
};

// Static method to find online users
userSchema.statics.findOnlineUsers = function() {
  return this.find({
    isOnline: true,
    isActive: true
  }).select('displayName photoURL location lastSeen');
};

export default mongoose.model('User', userSchema);
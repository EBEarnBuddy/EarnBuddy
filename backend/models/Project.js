import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  experience: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'lead'],
    required: true
  },
  skills: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  salary: {
    min: {
      type: Number,
      required: true,
      min: 0
    },
    max: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  equity: {
    type: String,
    maxlength: 50
  },
  benefits: [{
    type: String,
    trim: true,
    maxlength: 100
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  filled: {
    type: Boolean,
    default: false
  },
  applicants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    coverLetter: String,
    portfolio: String,
    expectedSalary: String,
    availability: String,
    appliedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shortlisted', 'accepted', 'rejected'],
      default: 'pending'
    }
  }]
});

const projectSchema = new mongoose.Schema({
  // Basic project info
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  company: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  industry: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  projectType: {
    type: String,
    enum: ['startup', 'enterprise', 'agency', 'nonprofit'],
    required: true
  },

  // Project details
  totalBudget: {
    min: {
      type: Number,
      required: true,
      min: 0
    },
    max: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  duration: {
    type: String,
    required: true,
    maxlength: 50
  },
  location: {
    type: String,
    required: true,
    maxlength: 100
  },
  remote: {
    type: Boolean,
    default: false
  },
  equity: {
    type: String,
    maxlength: 50
  },

  // Skills and tags
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],

  // Project status
  status: {
    type: String,
    enum: ['draft', 'open', 'closed', 'completed'],
    default: 'draft'
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  featured: {
    type: Boolean,
    default: false
  },

  // Project owner
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Roles
  roles: [roleSchema],

  // Benefits
  benefits: [{
    type: String,
    trim: true,
    maxlength: 100
  }],

  // Project requirements
  requirements: {
    teamSize: {
      type: Number,
      min: 1,
      default: 1
    },
    startDate: Date,
    endDate: Date,
    timezone: {
      type: String,
      default: 'UTC'
    }
  },

  // Engagement metrics
  views: {
    type: Number,
    default: 0
  },
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  totalApplicants: {
    type: Number,
    default: 0
  },

  // Project images and media
  images: [{
    url: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Contact information
  contact: {
    email: String,
    phone: String,
    website: String
  },

  // Additional information
  additionalInfo: {
    type: String,
    maxlength: 1000
  },

  // Project visibility
  isPublic: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted budget
projectSchema.virtual('formattedBudget').get(function() {
  const min = this.totalBudget.min.toLocaleString();
  const max = this.totalBudget.max.toLocaleString();
  const currency = this.totalBudget.currency;
  return `${currency}${min} - ${currency}${max}`;
});

// Virtual for open roles count
projectSchema.virtual('openRolesCount').get(function() {
  return this.roles.filter(role => !role.filled).length;
});

// Virtual for total roles count
projectSchema.virtual('totalRolesCount').get(function() {
  return this.roles.length;
});

// Indexes for better query performance
projectSchema.index({ title: 'text', description: 'text', company: 'text' });
projectSchema.index({ industry: 1 });
projectSchema.index({ projectType: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ owner: 1 });
projectSchema.index({ featured: 1, status: 1 });
projectSchema.index({ 'roles.skills': 1 });
projectSchema.index({ createdAt: -1 });

// Pre-save middleware to update total applicants
projectSchema.pre('save', function(next) {
  let totalApplicants = 0;
  this.roles.forEach(role => {
    totalApplicants += role.applicants.length;
  });
  this.totalApplicants = totalApplicants;
  next();
});

// Method to add view
projectSchema.methods.addView = function() {
  this.views += 1;
  return this.save();
};

// Method to toggle bookmark
projectSchema.methods.toggleBookmark = function(userId) {
  const bookmarkIndex = this.bookmarks.indexOf(userId);
  if (bookmarkIndex > -1) {
    this.bookmarks.splice(bookmarkIndex, 1);
  } else {
    this.bookmarks.push(userId);
  }
  return this.save();
};

// Method to apply to role
projectSchema.methods.applyToRole = async function(roleId, userId, applicationData) {
  const role = this.roles.id(roleId);
  if (!role) {
    throw new Error('Role not found');
  }

  if (role.filled) {
    throw new Error('Role is already filled');
  }

  // Check if user already applied
  const existingApplication = role.applicants.find(app => app.userId.toString() === userId.toString());
  if (existingApplication) {
    throw new Error('You have already applied to this role');
  }

  role.applicants.push({
    userId,
    ...applicationData
  });

  // Record activity for the user who applied
  try {
    const User = mongoose.model('User');
    const user = await User.findById(userId);
    if (user) {
      await user.addActivity(
        'applied_to_project',
        `Applied to ${role.title} role in ${this.title}`,
        {
          projectId: this._id,
          projectTitle: this.title,
          roleId: roleId,
          roleTitle: role.title,
          company: this.company
        }
      );
    }
  } catch (error) {
    console.error('Error recording activity:', error);
    // Don't fail the application if activity recording fails
  }

  return this.save();
};

// Static method to find projects by filters
projectSchema.statics.findByFilters = function(filters) {
  const query = { isActive: true, status: 'open' };

  if (filters.industry && filters.industry !== 'all') {
    query.industry = filters.industry;
  }

  if (filters.projectType && filters.projectType !== 'all') {
    query.projectType = filters.projectType;
  }

  if (filters.experience && filters.experience !== 'all') {
    query['roles.experience'] = filters.experience;
  }

  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  return this.find(query)
    .populate('owner', 'displayName photoURL')
    .sort({ featured: -1, createdAt: -1 });
};

// Static method to find projects by owner
projectSchema.statics.findByOwner = function(ownerId) {
  return this.find({ owner: ownerId })
    .populate('owner', 'displayName photoURL')
    .sort({ createdAt: -1 });
};

export default mongoose.model('Project', projectSchema);
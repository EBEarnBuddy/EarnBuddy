import express from 'express';
import Project from '../models/Project.js';
import { firebaseAuthMiddleware } from '../middleware/firebaseAuth.js';

const router = express.Router();

// Get all projects with filters
router.get('/', async (req, res) => {
  try {
    const {
      search,
      industry,
      projectType,
      experience,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filters = {
      search,
      industry,
      projectType,
      experience
    };

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const projects = await Project.findByFilters(filters)
      .skip(skip)
      .limit(parseInt(limit))
      .sort(sort);

    const total = await Project.countDocuments({ isActive: true, status: 'open' });

    res.json({
      success: true,
      data: projects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
      error: error.message
    });
  }
});

// Get single project by ID
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'displayName photoURL bio location')
      .populate('roles.applicants.userId', 'displayName photoURL email');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Add view count
    await project.addView();

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project',
      error: error.message
    });
  }
});

// Create new project (protected route)
router.post('/', firebaseAuthMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      company,
      industry,
      projectType,
      totalBudget,
      duration,
      location,
      remote,
      equity,
      tags,
      urgency,
      roles,
      benefits,
      requirements,
      contact,
      additionalInfo
    } = req.body;

    // Validate required fields
    if (!title || !description || !company || !industry || !projectType || !totalBudget || !duration || !location) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate roles
    if (!roles || roles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one role is required'
      });
    }

    const project = new Project({
      title,
      description,
      company,
      industry,
      projectType,
      totalBudget,
      duration,
      location,
      remote: remote || false,
      equity,
      tags: tags || [],
      urgency: urgency || 'medium',
      roles,
      benefits: benefits || [],
      requirements: requirements || {},
      contact: contact || {},
      additionalInfo,
      owner: req.user.id,
      status: 'open'
    });

    await project.save();

    // Record activity for project creation
    try {
      await req.user.addActivity(
        'created_project',
        `Created project: ${project.title}`,
        {
          projectId: project._id,
          projectTitle: project.title,
          company: project.company,
          industry: project.industry
        }
      );
    } catch (error) {
      console.error('Error recording activity:', error);
      // Don't fail project creation if activity recording fails
    }

    // Populate owner info
    await project.populate('owner', 'displayName photoURL');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: error.message
    });
  }
});

// Update project (protected route - owner only)
router.put('/:id', firebaseAuthMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is the owner
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project'
      });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('owner', 'displayName photoURL');

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: updatedProject
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project',
      error: error.message
    });
  }
});

// Delete project (protected route - owner only)
router.delete('/:id', firebaseAuthMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is the owner
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project'
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project',
      error: error.message
    });
  }
});

// Toggle bookmark (protected route)
router.post('/:id/bookmark', firebaseAuthMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const wasBookmarked = project.bookmarks.includes(req.user.id);
    await project.toggleBookmark(req.user.id);

    // Record activity for bookmarking
    try {
      const action = wasBookmarked ? 'unbookmarked_project' : 'bookmarked_project';
      const description = wasBookmarked
        ? `Removed ${project.title} from bookmarks`
        : `Bookmarked ${project.title}`;

      await req.user.addActivity(
        action,
        description,
        {
          projectId: project._id,
          projectTitle: project.title,
          company: project.company
        }
      );
    } catch (error) {
      console.error('Error recording activity:', error);
      // Don't fail bookmarking if activity recording fails
    }

    res.json({
      success: true,
      message: 'Bookmark toggled successfully',
      data: {
        bookmarked: project.bookmarks.includes(req.user.id)
      }
    });
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle bookmark',
      error: error.message
    });
  }
});

// Apply to role (protected route)
router.post('/:id/roles/:roleId/apply', firebaseAuthMiddleware, async (req, res) => {
  try {
    const { coverLetter, portfolio, expectedSalary, availability } = req.body;

    if (!coverLetter || !availability) {
      return res.status(400).json({
        success: false,
        message: 'Cover letter and availability are required'
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    await project.applyToRole(req.params.roleId, req.user.id, {
      coverLetter,
      portfolio,
      expectedSalary,
      availability
    });

    res.json({
      success: true,
      message: 'Application submitted successfully'
    });
  } catch (error) {
    console.error('Error applying to role:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit application',
      error: error.message
    });
  }
});

// Get user's projects (protected route)
router.get('/user/my-projects', firebaseAuthMiddleware, async (req, res) => {
  try {
    const projects = await Project.findByOwner(req.user.id);

    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user projects',
      error: error.message
    });
  }
});

// Get user's applications (protected route)
router.get('/user/applications', firebaseAuthMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({
      'roles.applicants.userId': req.user.id,
      isActive: true
    }).populate('owner', 'displayName photoURL');

    // Extract applications for the current user
    const applications = [];
    projects.forEach(project => {
      project.roles.forEach(role => {
        const userApplication = role.applicants.find(app => app.userId.toString() === req.user.id);
        if (userApplication) {
          applications.push({
            projectId: project._id,
            projectTitle: project.title,
            company: project.company,
            roleId: role._id,
            roleTitle: role.title,
            status: userApplication.status,
            appliedAt: userApplication.appliedAt,
            coverLetter: userApplication.coverLetter,
            portfolio: userApplication.portfolio,
            expectedSalary: userApplication.expectedSalary,
            availability: userApplication.availability
          });
        }
      });
    });

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Error fetching user applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user applications',
      error: error.message
    });
  }
});

// Get user's bookmarked projects (protected route)
router.get('/user/bookmarks', firebaseAuthMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({
      bookmarks: req.user.id,
      isActive: true
    }).populate('owner', 'displayName photoURL');

    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Error fetching bookmarked projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookmarked projects',
      error: error.message
    });
  }
});

// Update application status (protected route - project owner only)
router.put('/:id/roles/:roleId/applications/:applicationId/status', firebaseAuthMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'processing', 'shortlisted', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: pending, processing, shortlisted, accepted, rejected'
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is the project owner
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update application status'
      });
    }

    const role = project.roles.id(req.params.roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    const application = role.applicants.id(req.params.applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    application.status = status;
    await project.save();

    // Record activity for the applicant
    try {
      const User = mongoose.model('User');
      const applicant = await User.findById(application.userId);
      if (applicant) {
        const statusMessages = {
          'processing': 'Your application is being processed',
          'shortlisted': 'You have been shortlisted!',
          'accepted': 'Congratulations! Your application has been accepted!',
          'rejected': 'Your application was not selected'
        };

        await applicant.addActivity(
          'application_status_updated',
          `${statusMessages[status]} for ${role.title} role in ${project.title}`,
          {
            projectId: project._id,
            projectTitle: project.title,
            roleId: req.params.roleId,
            roleTitle: role.title,
            company: project.company,
            status: status
          }
        );
      }
    } catch (error) {
      console.error('Error recording activity:', error);
    }

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: { status }
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application status',
      error: error.message
    });
  }
});

export default router;
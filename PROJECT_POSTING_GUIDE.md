# Project Posting Guide - EarnBuddy Freelance Section

## Overview

The freelance section now has a complete "Post Project" functionality that allows users to create and manage team projects. This includes both frontend and backend implementation.

## Features

### Frontend Features
- **Multi-step Project Creation Form**: A comprehensive 3-step form for creating projects
- **Real-time Validation**: Form validation at each step
- **Rich Project Details**: Support for project information, roles, skills, and benefits
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode Support**: Full dark mode compatibility

### Backend Features
- **RESTful API**: Complete CRUD operations for projects
- **Authentication**: Protected routes for project management
- **Data Validation**: Server-side validation for all project data
- **MongoDB Integration**: Persistent storage with Mongoose
- **Search & Filtering**: Advanced search and filter capabilities

## Project Structure

### Backend Files
- `backend/models/Project.js` - Project data model with roles and applications
- `backend/routes/projects.js` - API routes for project operations
- `backend/server.js` - Updated to include project routes

### Frontend Files
- `src/components/CreateProjectModal.tsx` - Project creation modal component
- `src/lib/projectService.ts` - API service functions
- `src/pages/FreelancePage.tsx` - Updated to use real data and new modal

## API Endpoints

### Projects
- `GET /api/projects` - Get all projects with filters
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create new project (protected)
- `PUT /api/projects/:id` - Update project (protected, owner only)
- `DELETE /api/projects/:id` - Delete project (protected, owner only)

### Project Actions
- `POST /api/projects/:id/bookmark` - Toggle bookmark (protected)
- `POST /api/projects/:id/roles/:roleId/apply` - Apply to role (protected)

### User Projects
- `GET /api/projects/user/my-projects` - Get user's projects (protected)
- `GET /api/projects/user/bookmarks` - Get bookmarked projects (protected)

## Data Models

### Project Schema
```javascript
{
  title: String,
  description: String,
  company: String,
  industry: String,
  projectType: String,
  totalBudget: { min: Number, max: Number, currency: String },
  duration: String,
  location: String,
  remote: Boolean,
  equity: String,
  tags: [String],
  urgency: String,
  roles: [RoleSchema],
  benefits: [String],
  status: String,
  owner: ObjectId,
  views: Number,
  totalApplicants: Number
}
```

### Role Schema
```javascript
{
  title: String,
  description: String,
  experience: String,
  skills: [String],
  salary: { min: Number, max: Number, currency: String },
  equity: String,
  benefits: [String],
  priority: String,
  filled: Boolean,
  applicants: [ApplicationSchema]
}
```

## Usage

### Creating a Project
1. Navigate to the Freelance page
2. Click "Post Team Project" button
3. Fill out the 3-step form:
   - **Step 1**: Basic project details (title, description, company, industry)
   - **Step 2**: Project requirements (budget, duration, location, benefits)
   - **Step 3**: Team roles (add roles with skills, salary, and requirements)
4. Submit the form to create the project

### Applying to Projects
1. Browse available projects on the Freelance page
2. Click "View Open Roles" on any project
3. Click "Apply" on a specific role
4. Fill out the application form with cover letter and details
5. Submit application

### Managing Projects
- **Bookmarking**: Click the bookmark icon to save projects
- **Filtering**: Use industry, project type, and experience filters
- **Searching**: Use the search bar to find specific projects

## Setup Instructions

### Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Start the server: `npm start` or `npm run dev`

### Frontend Setup
1. Navigate to the project root: `cd ..`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

## Environment Variables

Make sure to set up these environment variables in your backend `.env` file:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:3000
```

## Features in Detail

### Project Creation Form
- **Step 1**: Basic project information with industry selection
- **Step 2**: Budget, timeline, location, and benefits
- **Step 3**: Multiple roles with detailed requirements

### Search and Filtering
- Text search across project titles, descriptions, and companies
- Industry-based filtering
- Project type filtering
- Experience level filtering

### Real-time Updates
- Projects list updates automatically after creation
- Bookmark status updates in real-time
- Application status tracking

## Error Handling

The system includes comprehensive error handling:
- Form validation with user-friendly messages
- API error responses with detailed messages
- Graceful error handling when API is unavailable
- Loading states and error states in the UI

## Security Features

- JWT-based authentication for protected routes
- Owner-only access for project updates and deletion
- Input validation and sanitization
- Rate limiting on API endpoints

## Future Enhancements

Potential improvements for the project posting system:
- Image upload for project screenshots
- Advanced search with multiple criteria
- Project analytics and insights
- Team collaboration features
- Payment integration for project budgets
- Notification system for applications
- Project templates and quick-start options
# EarnBuddy Backend

This is the backend API for the EarnBuddy platform, providing user authentication, profile management, and image upload features using Node.js, Express, MongoDB, and Cloudinary.

## Features
- User registration, login (email/password & Google OAuth)
- JWT authentication
- Full user profile CRUD (edit, skills, interests, preferences, onboarding, analytics, activity)
- Profile photo and image uploads (Cloudinary)
- Search and filter users by skills, location, role, etc.
- Rate limiting, security, and error handling

## Getting Started

### 1. Clone the repository
```bash
# From the project root
cd backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
- Copy `env.example` to `.env` and fill in your values:
```bash
cp env.example .env
```
- Set your MongoDB URI, JWT secret, and Cloudinary credentials.

### 4. Start the server
```bash
npm run dev
```
- The API will run at `http://localhost:5000/api`

## API Endpoints

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login with email/password
- `POST /api/auth/google` — Login/Register with Google
- `GET /api/auth/me` — Get current user (token required)
- `POST /api/auth/logout` — Logout

### Profile
- `GET /api/profile` — Get current user's profile
- `GET /api/profile/:userId` — Get public profile by ID
- `PUT /api/profile` — Update profile fields
- `PUT /api/profile/photo` — Update profile photo
- `PUT /api/profile/skills` — Update skills
- `PUT /api/profile/interests` — Update interests
- `PUT /api/profile/preferences` — Update preferences
- `POST /api/profile/onboarding` — Complete onboarding
- `GET /api/profile/analytics` — Get analytics
- `GET /api/profile/activity` — Get recent activity
- `GET /api/profile/search` — Search users
- `GET /api/profile/online` — Get online users
- `GET /api/profile/by-skills/:skills` — Get users by skills

### Upload
- `POST /api/upload/profile-photo` — Upload profile photo (multipart/form-data, field: `photo`)
- `POST /api/upload/images` — Upload multiple images (field: `images`)
- `DELETE /api/upload/image/:publicId` — Delete image from Cloudinary
- `GET /api/upload/signature` — Get Cloudinary upload signature

## Notes
- All `/api/profile` and `/api/upload` routes require a valid JWT token in the `Authorization: Bearer <token>` header.
- For development, use the provided `env.example` as a template for your `.env` file.
- The `uploads/` directory is used for temporary local file storage before uploading to Cloudinary.

## License
MIT
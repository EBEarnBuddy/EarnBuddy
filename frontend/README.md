# EarnBuddy Frontend

A modern React frontend for the EarnBuddy platform built with Vite, TypeScript, and Tailwind CSS.

## Features

- **React 18**: Latest React with hooks and modern patterns
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Firebase Authentication**: Secure user authentication
- **React Router**: Client-side routing
- **Axios**: HTTP client for API communication
- **Framer Motion**: Smooth animations and transitions
- **Radix UI**: Accessible UI components

## Project Structure

```
frontend/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # Base UI components
│   │   └── ...              # Feature-specific components
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx  # Authentication context
│   ├── hooks/               # Custom React hooks
│   │   └── useFirestore.ts  # Firestore hook
│   ├── lib/                 # Utility libraries
│   │   ├── axios.ts         # API client configuration
│   │   ├── firebase.ts      # Firebase configuration
│   │   └── utils.ts         # Utility functions
│   ├── pages/               # Page components
│   │   ├── AuthPage.tsx     # Authentication page
│   │   ├── CommunityPage.tsx # Community page
│   │   ├── DiscoverPage.tsx # Discover page
│   │   ├── FreelancePage.tsx # Freelance page
│   │   ├── PodPage.tsx      # Pod page
│   │   ├── ProfilePage.tsx  # Profile page
│   │   ├── RoomsPage.tsx    # Rooms page
│   │   ├── SettingsPage.tsx # Settings page
│   │   └── StartupsPage.tsx # Startups page
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # App entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── package.json             # Dependencies and scripts
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── README.md                # This file
```

## Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://localhost:8000
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   ```

## Running the Application

### Development
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Linting
```bash
npm run lint
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000` |
| `VITE_FIREBASE_API_KEY` | Firebase API key | - |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | - |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | - |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | - |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | - |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | - |

## API Integration

The frontend communicates with the FastAPI backend through the following endpoints:

### Authentication
- `POST /api/auth/verify` - Verify Firebase token
- `POST /api/auth/register` - Register new user
- `GET /api/auth/me` - Get current user info

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/{id}` - Get specific project
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project
- `POST /api/projects/{id}/apply` - Apply to project

### Profile
- `GET /api/profile` - Get current user profile
- `PUT /api/profile` - Update profile
- `GET /api/profile/{id}` - Get user public profile

### Pods
- `GET /api/pods` - Get all public pods
- `POST /api/pods` - Create new pod
- `GET /api/pods/my` - Get user's pods
- `GET /api/pods/{id}` - Get specific pod
- `POST /api/pods/{id}/join` - Join pod

### Posts
- `GET /api/posts` - Get posts
- `POST /api/posts` - Create new post
- `GET /api/posts/{id}` - Get specific post

### Messages
- `GET /api/messages/{room_id}` - Get room messages
- `POST /api/messages` - Send message

### File Upload
- `POST /api/upload` - Upload file

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

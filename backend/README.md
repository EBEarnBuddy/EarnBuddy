# EarnBuddy FastAPI Backend

A modern, fast, and scalable backend API for the EarnBuddy platform built with FastAPI and MongoDB.

## Features

- **FastAPI**: Modern, fast web framework for building APIs with Python
- **MongoDB**: NoSQL database with Motor for async operations
- **Firebase Authentication**: Secure user authentication and authorization
- **Pydantic Models**: Data validation and serialization
- **Async Support**: Full async/await support for better performance
- **Swagger UI**: Automatic API documentation at `/docs`
- **CORS Support**: Cross-origin resource sharing enabled
- **File Upload**: Support for file uploads with proper validation

## Project Structure

```
backend/
├── app/
│   ├── core/
│   │   └── firebase.py          # Firebase configuration
│   ├── database/
│   │   └── mongo.py             # MongoDB connection
│   ├── middleware/
│   │   └── auth.py              # Authentication middleware
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py              # User models
│   │   ├── project.py           # Project models
│   │   ├── pod.py               # Pod models
│   │   ├── post.py              # Post models
│   │   ├── reply.py             # Reply models
│   │   ├── room.py              # Room models
│   │   └── message.py           # Message models
│   └── routes/
│       ├── auth.py              # Authentication routes
│       ├── projects.py          # Project routes
│       ├── profile.py           # Profile routes
│       ├── upload.py            # File upload routes
│       ├── pods.py              # Pod routes
│       ├── posts.py             # Post routes
│       ├── reply.py             # Reply routes
│       ├── rooms.py             # Room routes
│       ├── messages.py          # Message routes
│       └── users.py             # User routes
├── uploads/                     # File upload directory
├── main.py                      # FastAPI application entry point
├── requirements.txt             # Python dependencies
├── env.example                  # Environment variables example
└── README.md                    # This file
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

5. **Set up MongoDB**
   - Install MongoDB locally or use MongoDB Atlas
   - Update `MONGODB_URI` in your `.env` file

6. **Set up Firebase**
   - Create a Firebase project
   - Download service account key
   - Update `FIREBASE_SERVICE_ACCOUNT_PATH` in your `.env` file

## Running the Application

### Development
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## API Documentation

Once the server is running, you can access:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/api/health

## API Endpoints

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

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/earnbuddy` |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Path to Firebase service account key | - |
| `PORT` | Server port | `8000` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `NODE_ENV` | Environment | `development` |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

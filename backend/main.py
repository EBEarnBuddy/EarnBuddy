from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv
from datetime import datetime

# Import routers
from app.routes import auth, projects, profile, upload, pods, posts, reply, rooms, messages, users

# Import database and firebase
from app.database.mongo import db
from app.core.firebase import initialize_firebase

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("INFO: Application startup sequence initiated.")
    initialize_firebase()
    # Connect to MongoDB
    try:
        await db.connect()
    except Exception as e:
        print(f"ERROR: Failed to connect to MongoDB: {e}")

    # Ensure MongoDB indexes
    try:
        print("INFO: Creating MongoDB indexes...")
        await db.users.create_index("email", unique=True)
        await db.users.create_index("uid", unique=True)
        await db.pods.create_index("slug", unique=True)
        await db.posts.create_index([("podId", 1), ("createdAt", -1)])
        await db.replies.create_index([("postId", 1), ("createdAt", 1)])
        await db.rooms.create_index([("name", 1)])
        await db.rooms.create_index([("members", 1)])
        await db.messages.create_index([("roomId", 1), ("createdAt", 1)])
        await db.projects.create_index([("authorId", 1), ("createdAt", -1)])
        await db.communityPosts.create_index([("createdAt", -1)])
        await db.communityPosts.create_index([("podId", 1), ("createdAt", -1)])
        print("INFO: MongoDB indexes created successfully.")
    except Exception as e:
        print(f"ERROR: Failed to create MongoDB indexes: {e}")

    print("INFO: Startup tasks completed. Application ready to serve.")
    yield

    print("INFO: Application shutdown sequence initiated.")
    # Close MongoDB connection
    try:
        await db.close()
    except Exception as e:
        print(f"ERROR: Failed to close MongoDB connection: {e}")
    print("INFO: Application shutdown complete.")

# Create FastAPI app
app = FastAPI(
    title="EarnBuddy API",
    description="Backend API for EarnBuddy platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        os.getenv("FRONTEND_URL", "http://localhost:3000")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {
        "status": "OK",
        "message": "EarnBuddy API is running",
        "timestamp": datetime.utcnow().isoformat()
    }

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
app.include_router(profile.router, prefix="/api/profile", tags=["Profile"])
app.include_router(upload.router, prefix="/api/upload", tags=["File Upload"])
app.include_router(pods.router, prefix="/api/pods", tags=["Pods"])
app.include_router(posts.router, prefix="/api/posts", tags=["Posts"])
app.include_router(reply.router, prefix="/api/replies", tags=["Replies"])
app.include_router(rooms.router, prefix="/api/rooms", tags=["Rooms"])
app.include_router(messages.router, prefix="/api/messages", tags=["Messages"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])

# Root endpoint
@app.get("/")
async def root():
    return {"message": "EarnBuddy API is running!"}

# Test MongoDB connection
@app.get("/api/test-mongo")
async def test_mongo_connection():
    try:
        collections = await db.list_collection_names()
        return {"status": "connected", "collections": collections}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not connect to MongoDB: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )

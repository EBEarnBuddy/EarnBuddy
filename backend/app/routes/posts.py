import json
import os
from fastapi import APIRouter, HTTPException, status, Depends, Query
from app.database.mongo import db
from app.models.post import PostModel, PostCreate, PostUpdate
from app.middleware.auth import get_current_user
from datetime import datetime
from bson import ObjectId
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter(tags=["posts"])

# Simple in-memory storage for community posts (temporary solution)
COMMUNITY_POSTS_FILE = "community_posts.json"

def load_community_posts():
    """Load community posts from file."""
    try:
        if os.path.exists(COMMUNITY_POSTS_FILE):
            with open(COMMUNITY_POSTS_FILE, 'r') as f:
                return json.load(f)
    except Exception as e:
        print(f"Error loading community posts: {e}")
    return []

def save_community_posts(posts):
    """Save community posts to file."""
    try:
        with open(COMMUNITY_POSTS_FILE, 'w') as f:
            json.dump(posts, f, default=str)
    except Exception as e:
        print(f"Error saving community posts: {e}")

# Load existing posts on startup
community_posts = load_community_posts()

# Community Post Models
class CommunityPostCreate(BaseModel):
    content: str
    selectedPod: Optional[str] = None
    images: Optional[List[str]] = []
    documents: Optional[List[dict]] = []
    emoji: Optional[str] = None
    tags: Optional[List[str]] = []
    # Add user info from frontend
    userName: Optional[str] = None
    userAvatar: Optional[str] = None
    userId: Optional[str] = None

class CommunityPostResponse(BaseModel):
    id: str
    userId: str
    userName: str
    userAvatar: Optional[str] = None
    content: str
    podId: str
    type: str
    imageUrl: Optional[str] = None
    images: List[str] = []
    documents: List[dict] = []
    emoji: Optional[str] = None
    tags: List[str] = []
    likes: List[str] = []
    comments: List[dict] = []
    bookmarks: List[str] = []
    reactions: dict = {}
    createdAt: datetime
    updatedAt: datetime

@router.post("/community-posts")
async def create_community_post(
    post_data: CommunityPostCreate
    # Temporarily removed authentication requirement
    # current_user: dict = Depends(get_current_user)
):
    """Create a new community post visible to all users."""
    try:
        # Create community post document with default user info
        post_doc = {
            "_id": str(ObjectId()),
            "userId": "anonymous",  # Default user ID
            "userName": "Anonymous User",
            "userAvatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
            "content": post_data.content,
            "podId": post_data.selectedPod or "community",
            "type": "text",
            "imageUrl": post_data.images[0] if post_data.images else None,
            "images": post_data.images or [],
            "documents": post_data.documents or [],
            "emoji": post_data.emoji,
            "tags": post_data.tags or [],
            "likes": [],
            "comments": [],
            "bookmarks": [],
            "reactions": {},
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat()
        }

        # Add user info from frontend if provided
        if post_data.userName:
            post_doc["userName"] = post_data.userName
        if post_data.userAvatar:
            post_doc["userAvatar"] = post_data.userAvatar
        if post_data.userId:
            post_doc["userId"] = post_data.userId

        # Add to in-memory storage
        global community_posts
        community_posts.insert(0, post_doc)
        save_community_posts(community_posts)

        # If posting to a specific pod, update pod's post count
        if post_data.selectedPod:
            await db.pods.update_one(
                {"name": post_data.selectedPod},
                {"$inc": {"postCount": 1}, "$set": {"lastActivity": datetime.utcnow()}}
            )

        return {
            "success": True,
            "message": "Community post created successfully",
            "data": {"post": post_doc}
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create community post: {str(e)}"
        )

@router.get("/community-posts")
async def get_community_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    pod_filter: Optional[str] = Query(None, description="Filter by pod name")
):
    """Get all community posts visible to everyone."""
    try:
        # Get posts from in-memory storage
        global community_posts

        # Filter by pod if specified
        filtered_posts = community_posts
        if pod_filter:
            filtered_posts = [post for post in community_posts if post.get("podId") == pod_filter]

        # Apply pagination
        total = len(filtered_posts)
        posts = filtered_posts[skip:skip + limit]

        return {
            "success": True,
            "data": {
                "posts": posts,
                "total": total,
                "skip": skip,
                "limit": limit
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch community posts: {str(e)}"
        )

@router.post("/community-posts/{post_id}/like")
async def like_community_post(
    post_id: str
    # Temporarily removed authentication requirement
    # current_user: dict = Depends(get_current_user)
):
    """Like or unlike a community post."""
    try:
        # Find post in in-memory storage
        global community_posts
        post = None
        post_index = -1

        for i, p in enumerate(community_posts):
            if p.get("_id") == post_id:
                post = p
                post_index = i
                break

        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post not found"
            )

        # For now, just toggle like status without user tracking
        likes = post.get("likes", [])
        if len(likes) > 0:
            # Unlike
            community_posts[post_index]["likes"] = []
            action = "unliked"
        else:
            # Like
            community_posts[post_index]["likes"] = ["anonymous"]
            action = "liked"

        # Save to file
        save_community_posts(community_posts)

        return {
            "success": True,
            "message": f"Post {action} successfully",
            "data": {"action": action}
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to like/unlike post: {str(e)}"
        )
@router.post("/")
async def create_post(
    post_data: PostCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new post."""
    try:
        # Get pod info
        pod = await db.pods.find_one({"_id": ObjectId(post_data.podId)})
        if not pod:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pod not found"
            )

        # Check if user is member of pod
        if current_user["_id"] not in pod.get("members", []):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not a member of this pod"
            )

        post_obj = PostModel(
            **post_data.model_dump(),
            authorId=current_user["_id"],
            authorName=current_user.get("displayName", "Anonymous"),
            authorAvatar=current_user.get("photoURL", ""),
            podName=pod.get("name", ""),
            createdAt=datetime.utcnow(),
            updatedAt=datetime.utcnow()
        )

        post_doc = post_obj.model_dump(by_alias=True, exclude_none=True)
        post_doc["_id"] = ObjectId()

        await db.posts.insert_one(post_doc)

        # Increment pod post count
        await db.pods.update_one(
            {"_id": ObjectId(post_data.podId)},
            {"$inc": {"postCount": 1}}
        )

        return {
            "success": True,
            "message": "Post created successfully",
            "data": {"post": post_doc}
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create post: {str(e)}"
        )

@router.get("/")
async def get_posts(
    pod_id: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100)
):
    """Get posts with optional pod filtering."""
    try:
        filter_query = {}
        if pod_id:
            if not ObjectId.is_valid(pod_id):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid pod ID"
                )
            filter_query["podId"] = ObjectId(pod_id)

        cursor = db.posts.find(filter_query).skip(skip).limit(limit).sort("createdAt", -1)
        posts = await cursor.to_list(length=limit)

        total = await db.posts.count_documents(filter_query)

        return {
            "success": True,
            "data": {
                "posts": posts,
                "total": total,
                "skip": skip,
                "limit": limit
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch posts: {str(e)}"
        )

@router.get("/{post_id}")
async def get_post(post_id: str):
    """Get a specific post by ID."""
    try:
        if not ObjectId.is_valid(post_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid post ID"
            )

        post = await db.posts.find_one({"_id": ObjectId(post_id)})
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post not found"
            )

        # Increment view count
        await db.posts.update_one(
            {"_id": ObjectId(post_id)},
            {"$inc": {"viewCount": 1}}
        )

        return {
            "success": True,
            "data": {"post": post}
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch post: {str(e)}"
        )


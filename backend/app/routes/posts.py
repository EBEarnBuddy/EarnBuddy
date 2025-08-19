from fastapi import APIRouter, HTTPException, status, Depends, Query
from app.database.mongo import db
from app.models.post import PostModel, PostCreate, PostUpdate
from app.middleware.auth import get_current_user
from datetime import datetime
from bson import ObjectId
from typing import List, Optional

router = APIRouter()

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

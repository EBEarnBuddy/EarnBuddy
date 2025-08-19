from fastapi import APIRouter, HTTPException, status, Depends, Query
from app.database.mongo import db
from app.middleware.auth import get_current_user
from datetime import datetime
from bson import ObjectId
from typing import List, Optional

router = APIRouter()

@router.get("/")
async def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    role: Optional[str] = Query(None),
    skills: Optional[str] = Query(None)
):
    """Get all users with optional filtering."""
    try:
        filter_query = {}
        if role:
            filter_query["role"] = role
        if skills:
            skill_list = [s.strip() for s in skills.split(",")]
            filter_query["skills"] = {"$in": skill_list}
            
        cursor = db.users.find(filter_query).skip(skip).limit(limit).sort("createdAt", -1)
        users = await cursor.to_list(length=limit)
        
        # Return only public profile data
        public_users = []
        for user in users:
            public_user = {
                "id": str(user["_id"]),
                "displayName": user.get("displayName"),
                "photoURL": user.get("photoURL"),
                "bio": user.get("bio"),
                "location": user.get("location"),
                "skills": user.get("skills", []),
                "interests": user.get("interests", []),
                "experience": user.get("experience"),
                "role": user.get("role"),
                "rating": user.get("rating", 0.0),
                "completedProjects": user.get("completedProjects", 0),
                "joinDate": user.get("joinDate")
            }
            public_users.append(public_user)
        
        total = await db.users.count_documents(filter_query)
        
        return {
            "success": True,
            "data": {
                "users": public_users,
                "total": total,
                "skip": skip,
                "limit": limit
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch users: {str(e)}"
        )

@router.get("/{user_id}")
async def get_user(user_id: str):
    """Get a user's public profile by ID."""
    try:
        if not ObjectId.is_valid(user_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user ID"
            )
            
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
            
        # Return only public profile data
        public_profile = {
            "id": str(user["_id"]),
            "displayName": user.get("displayName"),
            "photoURL": user.get("photoURL"),
            "bio": user.get("bio"),
            "location": user.get("location"),
            "skills": user.get("skills", []),
            "interests": user.get("interests", []),
            "experience": user.get("experience"),
            "role": user.get("role"),
            "rating": user.get("rating", 0.0),
            "completedProjects": user.get("completedProjects", 0),
            "joinDate": user.get("joinDate")
        }
        
        return {
            "success": True,
            "data": {"user": public_profile}
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user: {str(e)}"
        )

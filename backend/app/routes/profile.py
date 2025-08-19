from fastapi import APIRouter, HTTPException, status, Depends
from app.database.mongo import db
from app.models.user import UserUpdate
from app.middleware.auth import get_current_user
from datetime import datetime
from bson import ObjectId

router = APIRouter()

@router.get("/")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get current user's profile."""
    return {
        "success": True,
        "data": {"user": current_user}
    }

@router.put("/")
async def update_profile(
    user_data: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update user profile."""
    try:
        update_data = user_data.model_dump(exclude_unset=True)
        update_data["updatedAt"] = datetime.utcnow()
        
        await db.users.update_one(
            {"_id": current_user["_id"]},
            {"$set": update_data}
        )
        
        updated_user = await db.users.find_one({"_id": current_user["_id"]})
        
        return {
            "success": True,
            "message": "Profile updated successfully",
            "data": {"user": updated_user}
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}"
        )

@router.get("/{user_id}")
async def get_user_profile(user_id: str):
    """Get a user's public profile."""
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
            detail=f"Failed to fetch profile: {str(e)}"
        )

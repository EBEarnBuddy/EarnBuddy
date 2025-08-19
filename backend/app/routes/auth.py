from fastapi import APIRouter, HTTPException, status, Depends
from app.core.firebase import verify_token, get_user_by_uid
from app.database.mongo import db
from app.models.user import UserModel, UserCreate
from app.middleware.auth import get_current_user
from datetime import datetime
from bson import ObjectId
from typing import Dict, Any

router = APIRouter()

@router.post("/verify")
async def verify_id_token(data: Dict[str, Any]):
    """Verify Firebase ID token and create/update user."""
    token = data.get("token")
    if not token:
        raise HTTPException(status_code=400, detail="Token not provided")
    
    try:
        decoded = verify_token(token)
        uid = decoded["uid"]
        email = decoded.get("email", "")
        display_name = decoded.get("name", "Anonymous User")
        photo_url = decoded.get("picture", "")

        # Check if user exists
        existing_user = await db.users.find_one({"uid": uid})
        
        if not existing_user:
            # Create new user
            user_obj = UserModel(
                uid=uid,
                email=email,
                displayName=display_name,
                photoURL=photo_url,
                createdAt=datetime.utcnow(),
                updatedAt=datetime.utcnow(),
                joinDate=datetime.utcnow(),
            )
            
            user_doc = user_obj.model_dump(by_alias=True, exclude_none=True)
            user_doc["_id"] = ObjectId()
            
            await db.users.insert_one(user_doc)
            existing_user = await db.users.find_one({"_id": user_doc["_id"]})

        # Return user data
        if existing_user:
            return {
                "status": "success", 
                "user": {
                    "uid": existing_user.get("uid"), 
                    "email": existing_user.get("email"), 
                    "displayName": existing_user.get("displayName"),
                    "photoURL": existing_user.get("photoURL", ""),
                    "onboardingCompleted": existing_user.get("onboardingCompleted", False)
                }
            }
        
        raise HTTPException(status_code=500, detail="Failed to retrieve user data after verification.")

    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.post("/register")
async def register_user(user_data: UserCreate):
    """Register a new user with email/password."""
    try:
        # Check if user already exists
        existing_user = await db.users.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )

        # Create new user
        user_obj = UserModel(
            email=user_data.email,
            displayName=user_data.displayName,
            firstName=user_data.firstName,
            lastName=user_data.lastName,
            uid=user_data.uid,
            googleId=user_data.googleId,
            firebaseUid=user_data.firebaseUid,
            createdAt=datetime.utcnow(),
            updatedAt=datetime.utcnow(),
            joinDate=datetime.utcnow(),
        )
        
        user_doc = user_obj.model_dump(by_alias=True, exclude_none=True)
        user_doc["_id"] = ObjectId()
        
        await db.users.insert_one(user_doc)
        
        return {
            "success": True,
            "message": "User registered successfully",
            "data": {
                "user": {
                    "id": str(user_doc["_id"]),
                    "email": user_data.email,
                    "displayName": user_data.displayName,
                    "firstName": user_data.firstName,
                    "lastName": user_data.lastName,
                    "photoURL": user_data.photoURL,
                    "onboardingCompleted": False
                }
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information."""
    return {
        "success": True,
        "data": {
            "user": {
                "id": str(current_user["_id"]),
                "uid": current_user.get("uid"),
                "email": current_user.get("email"),
                "displayName": current_user.get("displayName"),
                "firstName": current_user.get("firstName"),
                "lastName": current_user.get("lastName"),
                "photoURL": current_user.get("photoURL", ""),
                "bio": current_user.get("bio", ""),
                "location": current_user.get("location", ""),
                "skills": current_user.get("skills", []),
                "interests": current_user.get("interests", []),
                "experience": current_user.get("experience", "beginner"),
                "role": current_user.get("role", "builder"),
                "rating": current_user.get("rating", 0.0),
                "totalEarnings": current_user.get("totalEarnings", "$0"),
                "completedProjects": current_user.get("completedProjects", 0),
                "onboardingCompleted": current_user.get("onboardingCompleted", False),
                "createdAt": current_user.get("createdAt"),
                "joinDate": current_user.get("joinDate")
            }
        }
    }

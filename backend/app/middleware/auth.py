from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from app.core.firebase import verify_token
from app.database.mongo import db
from bson import ObjectId

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from Firebase token."""
    try:
        token = credentials.credentials
        decoded_token = verify_token(token)
        uid = decoded_token.get("uid")

        if not uid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

        # Find user in database
        user = await db.users.find_one({"uid": uid})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )

async def get_current_user_id(current_user: dict = Depends(get_current_user)) -> ObjectId:
    """Get current user ID as ObjectId."""
    return current_user["_id"]

async def get_current_user_uid(current_user: dict = Depends(get_current_user)) -> str:
    """Get current user UID."""
    return current_user["uid"]

def require_auth():
    """Decorator to require authentication."""
    return Depends(get_current_user)

def require_user_id():
    """Decorator to require user ID."""
    return Depends(get_current_user_id)

def require_user_uid():
    """Decorator to require user UID."""
    return Depends(get_current_user_uid)

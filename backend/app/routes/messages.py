from fastapi import APIRouter, HTTPException, status, Depends, Query
from app.database.mongo import db
from app.models.message import MessageModel, MessageCreate, MessageUpdate
from app.middleware.auth import get_current_user
from datetime import datetime
from bson import ObjectId
from typing import List, Optional

router = APIRouter()

@router.post("/")
async def create_message(
    message_data: MessageCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new message."""
    try:
        # Check if room exists and user is member
        room = await db.rooms.find_one({"_id": ObjectId(message_data.roomId)})
        if not room:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Room not found"
            )
            
        if current_user["_id"] not in room.get("members", []):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not a member of this room"
            )
            
        message_obj = MessageModel(
            **message_data.model_dump(),
            authorId=current_user["_id"],
            authorName=current_user.get("displayName", "Anonymous"),
            authorAvatar=current_user.get("photoURL", ""),
            createdAt=datetime.utcnow(),
            updatedAt=datetime.utcnow()
        )
        
        message_doc = message_obj.model_dump(by_alias=True, exclude_none=True)
        message_doc["_id"] = ObjectId()
        
        await db.messages.insert_one(message_doc)
        
        # Increment room message count
        await db.rooms.update_one(
            {"_id": ObjectId(message_data.roomId)},
            {"$inc": {"messageCount": 1}}
        )
        
        return {
            "success": True,
            "message": "Message sent successfully",
            "data": {"message": message_doc}
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send message: {str(e)}"
        )

@router.get("/{room_id}")
async def get_messages(
    room_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """Get messages for a specific room."""
    try:
        if not ObjectId.is_valid(room_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid room ID"
            )
            
        # Check if user is member of room
        room = await db.rooms.find_one({"_id": ObjectId(room_id)})
        if not room:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Room not found"
            )
            
        if current_user["_id"] not in room.get("members", []):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not a member of this room"
            )
            
        cursor = db.messages.find({"roomId": ObjectId(room_id)}).skip(skip).limit(limit).sort("createdAt", -1)
        messages = await cursor.to_list(length=limit)
        
        total = await db.messages.count_documents({"roomId": ObjectId(room_id)})
        
        return {
            "success": True,
            "data": {
                "messages": messages,
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
            detail=f"Failed to fetch messages: {str(e)}"
        )

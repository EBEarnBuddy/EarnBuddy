from fastapi import APIRouter, HTTPException, status, Depends, Query, Response
from app.database.mongo import db
from app.models.message import MessageModel, MessageCreate, MessageUpdate
from app.middleware.auth import get_current_user
from datetime import datetime
from bson import ObjectId
from typing import List, Optional
import json
import os
from pydantic import BaseModel

router = APIRouter()

# Simple file-based storage for room messages
ROOM_MESSAGES_FILE = "room_messages.json"

def load_room_messages():
    """Load room messages from file."""
    try:
        if os.path.exists(ROOM_MESSAGES_FILE):
            with open(ROOM_MESSAGES_FILE, 'r') as f:
                return json.load(f)
    except Exception as e:
        print(f"Error loading room messages: {e}")
    return {}

def save_room_messages(messages):
    """Save room messages to file."""
    try:
        with open(ROOM_MESSAGES_FILE, 'w') as f:
            json.dump(messages, f, default=str)
    except Exception as e:
        print(f"Error saving room messages: {e}")

# Load existing messages on startup
room_messages = load_room_messages()

# Room Message Models
class RoomMessageCreate(BaseModel):
    roomId: str
    content: str
    senderId: str
    senderName: str
    senderAvatar: str
    type: str = "text"
    attachment: Optional[dict] = None

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

# Room messaging endpoints (no authentication required)

@router.options("/room")
async def create_room_message_options(response: Response):
    """Handle CORS preflight for POST /room"""
    response.headers["Access-Control-Allow-Origin"] = "https://beta.earnbuddy.tech"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "*"
    response.headers["Access-Control-Max-Age"] = "86400"
    return {"message": "OK"}

@router.post("/room")
async def create_room_message(
    message_data: RoomMessageCreate,
    response: Response
):
    # Add CORS headers
    response.headers["Access-Control-Allow-Origin"] = "https://beta.earnbuddy.tech"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "*"
    """Create a new room message."""
    try:
        # Create room message document
        message_doc = {
            "_id": str(ObjectId()),
            "roomId": message_data.roomId,
            "content": message_data.content,
            "senderId": message_data.senderId,
            "senderName": message_data.senderName,
            "senderAvatar": message_data.senderAvatar,
            "type": message_data.type,
            "attachment": message_data.attachment,
            "timestamp": datetime.utcnow().isoformat()
        }

        # Add to in-memory storage
        global room_messages
        if message_data.roomId not in room_messages:
            room_messages[message_data.roomId] = []

        room_messages[message_data.roomId].append(message_doc)
        save_room_messages(room_messages)

        return {
            "success": True,
            "message": "Room message sent successfully",
            "data": {"message": message_doc}
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send room message: {str(e)}"
        )

@router.options("/room/{room_id}")
async def get_room_messages_options(room_id: str, response: Response):
    """Handle CORS preflight for GET /room/{room_id}"""
    response.headers["Access-Control-Allow-Origin"] = "https://beta.earnbuddy.tech"
    response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "*"
    response.headers["Access-Control-Max-Age"] = "86400"
    return {"message": "OK"}

@router.get("/room/{room_id}")
async def get_room_messages(
    room_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    response: Response
):
    # Add CORS headers
    response.headers["Access-Control-Allow-Origin"] = "https://beta.earnbuddy.tech"
    response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "*"
    """Get messages for a specific room."""
    try:
        # Get messages from in-memory storage
        global room_messages

        messages = room_messages.get(room_id, [])

        # Apply pagination
        total = len(messages)
        paginated_messages = messages[skip:skip + limit]

        return {
            "success": True,
            "data": {
                "messages": paginated_messages,
                "total": total,
                "skip": skip,
                "limit": limit
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch room messages: {str(e)}"
        )

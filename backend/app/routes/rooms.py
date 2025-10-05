from fastapi import APIRouter, HTTPException, status, Depends, Query
from app.database.mongo import db
from app.models.room import RoomModel, RoomCreate, RoomUpdate
from app.middleware.auth import get_current_user
from datetime import datetime
from bson import ObjectId
from typing import List, Optional

router = APIRouter()

@router.post("/")
async def create_room(
    room_data: RoomCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new room."""
    try:
        room_obj = RoomModel(
            **room_data.model_dump(),
            creatorId=current_user["_id"],
            creatorName=current_user.get("displayName", "Anonymous"),
            members=[current_user["_id"]],
            memberCount=1,
            createdAt=datetime.utcnow(),
            updatedAt=datetime.utcnow()
        )
        
        room_doc = room_obj.model_dump(by_alias=True, exclude_none=True)
        room_doc["_id"] = ObjectId()
        
        await db.rooms.insert_one(room_doc)
        
        # Add to user's joined rooms
        await db.users.update_one(
            {"_id": current_user["_id"]},
            {"$addToSet": {"joinedRooms": room_doc["_id"]}}
        )
        
        return {
            "success": True,
            "message": "Room created successfully",
            "data": {"room": room_doc}
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create room: {str(e)}"
        )

@router.get("/")
async def get_rooms(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100)
):
    """Get all public rooms."""
    try:
        filter_query = {"isPrivate": False}
        cursor = db.rooms.find(filter_query).skip(skip).limit(limit).sort("createdAt", -1)
        rooms = await cursor.to_list(length=limit)
        
        total = await db.rooms.count_documents(filter_query)
        
        return {
            "success": True,
            "data": {
                "rooms": rooms,
                "total": total,
                "skip": skip,
                "limit": limit
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch rooms: {str(e)}"
        )

@router.get("/my")
async def get_my_rooms(current_user: dict = Depends(get_current_user)):
    """Get rooms the current user is a member of."""
    try:
        cursor = db.rooms.find({"members": current_user["_id"]})
        rooms = await cursor.to_list(length=None)
        
        return {
            "success": True,
            "data": {"rooms": rooms}
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user rooms: {str(e)}"
        )

@router.get("/{room_id}")
async def get_room(room_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific room by ID."""
    try:
        if not ObjectId.is_valid(room_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid room ID"
            )
            
        room = await db.rooms.find_one({"_id": ObjectId(room_id)})
        if not room:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Room not found"
            )
            
        # Check if user can access private room
        if room.get("isPrivate", False) and current_user["_id"] not in room.get("members", []):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this room"
            )
            
        return {
            "success": True,
            "data": {"room": room}
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch room: {str(e)}"
        )

@router.post("/{room_id}/join")
async def join_room(room_id: str, current_user: dict = Depends(get_current_user)):
    """Join a room."""
    try:
        if not ObjectId.is_valid(room_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid room ID"
            )
            
        room = await db.rooms.find_one({"_id": ObjectId(room_id)})
        if not room:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Room not found"
            )
            
        # Check if already a member
        if current_user["_id"] in room.get("members", []):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Already a member of this room"
            )
            
        # Add user to room
        await db.rooms.update_one(
            {"_id": ObjectId(room_id)},
            {
                "$addToSet": {"members": current_user["_id"]},
                "$inc": {"memberCount": 1}
            }
        )
        
        # Add room to user's joined rooms
        await db.users.update_one(
            {"_id": current_user["_id"]},
            {"$addToSet": {"joinedRooms": ObjectId(room_id)}}
        )
        
        return {
            "success": True,
            "message": "Successfully joined room"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to join room: {str(e)}"
        )

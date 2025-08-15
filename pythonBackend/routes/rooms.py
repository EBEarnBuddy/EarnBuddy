# backend/routes/rooms.py

from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from datetime import datetime,timezone
from pydantic import ValidationError
from pymongo.errors import DuplicateKeyError

from pythonBackend.database.mongo import db
from pythonBackend.models.rooms import RoomModel # Import RoomModel
from pythonBackend.models.pyobjectid import PyObjectId # For ID validation
from pythonBackend.dependencies import get_current_user_uid # For authentication
from bson import ObjectId # For converting string IDs to MongoDB's ObjectId



router = APIRouter(
    prefix="/rooms",
    tags=["Rooms"]
)

# Helper function to convert doc from MongoDB to Pydantic Model
def convert_room_doc_to_model(doc, model_class):
    if doc is None:
        return None
    doc['id'] = str(doc['_id'])
     # Ensure any PyObjectId fields are converted to string for Pydantic
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            doc[key] = str(value)
        elif isinstance(value, list) and all(isinstance(item, ObjectId) for item in value):
            doc[key] = [str(item) for item in value]
    return model_class.model_validate(doc)
    


@router.post("/", response_model=RoomModel, status_code=status.HTTP_201_CREATED)
async def create_room(room: RoomModel, current_user_uid: str = Depends(get_current_user_uid)):
    # Check if a room with this name already exists (case-insensitive for better UX)
    existing_room = await db.rooms.find_one({"name": {"$regex": f"^{room.name}$", "$options": "i"}})
    if existing_room:
        raise HTTPException(status_code=409, detail="Room with this name already exists.")

    room.createdBy = current_user_uid
    room.createdAt = datetime.now(timezone.utc) 
    room.lastActivity = datetime.now(timezone.utc) 

    if room.members is None:
        room.members = []
    if current_user_uid not in room.members:
        room.members.append(current_user_uid)

    # Ensure topics list is initialized if it's None from frontend
    if room.topics is None:
        room.topics = []
    try:
        room_dict = room.model_dump(by_alias=True, exclude_none=True)
        result = await db.rooms.insert_one(room_dict)
        created_room_doc = await db.rooms.find_one({"_id": result.inserted_id})

        if created_room_doc:
            await db.users.update_one(
                {"uid": current_user_uid},
                {"$addToSet": {"joinedRooms": created_room_doc['_id']}}
            )
            return convert_room_doc_to_model(created_room_doc, RoomModel)
        raise HTTPException(status_code=500, detail="Failed to retrieve created room.")
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=f"Validation error: {e.errors()}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create room: {e}")
    



# --- Add Room Member ---
@router.post("/{room_id}/members", response_model=RoomModel)
async def add_room_member(
    room_id: str, 
    member_uid: str, # The UID of the user to add
    current_user_uid: str = Depends(get_current_user_uid)
):
    try:
        object_id = ObjectId(room_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Room ID format.")

    room = await db.rooms.find_one({"_id": object_id})
    if not room:
        raise HTTPException(status_code=404, detail="Room not found.")

    # Authorization: Only the creator can add members (or an admin, if implemented)
    if room['createdBy'] != current_user_uid:
        raise HTTPException(status_code=403, detail="Not authorized to add members to this room.")

    # Check if the member_uid exists as a user in your system (optional but recommended)
    existing_member_user = await db.users.find_one({"uid": member_uid})
    if not existing_member_user:
        raise HTTPException(status_code=404, detail="Member UID does not correspond to an existing user.")

    # Add member to the room's members list
    await db.rooms.update_one({"_id": object_id}, {"$addToSet": {"members": member_uid}})
    
    # --- IMPORTANT ADDITION 2: Update the added member's joinedRooms list ---
    await db.users.update_one(
        {"uid": member_uid}, # This is the UID of the user who was added
        {"$addToSet": {"joinedRooms": object_id}} # Add the room's _id to their joinedRooms
    )
    # -----------------------------------------------------------------------

    updated_room = await db.rooms.find_one({"_id": object_id})
    return convert_room_doc_to_model(updated_room, RoomModel)

# --- Remove Member from Room ---
@router.delete("/{room_id}/members/{member_uid_to_remove}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_room_member(
    room_id: str,
    member_uid_to_remove: str, # The UID of the member to remove
    current_user_uid: str = Depends(get_current_user_uid)
):
    try:
        object_id = ObjectId(room_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Room ID format.")

    room = await db.rooms.find_one({"_id": object_id})
    if not room:
        raise HTTPException(status_code=404, detail="Room not found.")

    # Authorization: Only the creator can remove members (or an admin)
    if room['createdBy'] != current_user_uid:
        raise HTTPException(status_code=403, detail="Not authorized to remove members from this room.")
    
    if member_uid_to_remove not in room.get("members", []):
        raise HTTPException(status_code=404, detail="Member not found in room.")

    # Remove member from the room's members list
    await db.rooms.update_one({"_id": object_id}, {"$pull": {"members": member_uid_to_remove}})
    
    # --- IMPORTANT ADDITION 3: Update the removed member's joinedRooms list ---
    await db.users.update_one(
        {"uid": member_uid_to_remove},
        {"$pull": {"joinedRooms": object_id}} # Remove the room's _id from their joinedRooms
    )
    # ------------------------------------------------------------------------

    return # 204 No Content


# Replace your two GET "/" routes with this single, updated version
# This combines "get_all_rooms" with and without filters
@router.get("/", response_model=List[RoomModel], summary="Get all rooms with optional search and topic filters")
async def get_all_rooms(
    current_user_uid: str = Depends(get_current_user_uid),
    search_query: Optional[str] = None,
    topics: Optional[List[str]] = Query(None)
):
    query_filters = {
        "$or": [
            {"isPrivate": False},
            {"members": current_user_uid}
        ]
    }
    
    if search_query:
        # Case-insensitive search on name and/or description
        query_filters["$or"].append({
            "$or": [
                {"name": {"$regex": search_query, "$options": "i"}},
                {"description": {"$regex": search_query, "$options": "i"}}
            ]
        })

    if topics:
        query_filters["topics"] = {"$all": topics}

    rooms = []
    async for room_doc in db.rooms.find(query_filters):
        rooms.append(convert_room_doc_to_model(room_doc, RoomModel))
    
    # Optional: Sort rooms here if desired, e.g., by lastActivity
    rooms.sort(key=lambda r: r.lastActivity if r.lastActivity else datetime.min, reverse=True)
    
    return rooms

# --- Join Room (User Initiated) ---
@router.post("/{room_id}/join", response_model=RoomModel, summary="Allow current user to join a room")
async def join_room(
    room_id: str,
    current_user_uid: str = Depends(get_current_user_uid)
):
    try:
        object_id = ObjectId(room_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Room ID format.")

    room_doc = await db.rooms.find_one({"_id": object_id})
    if not room_doc:
        raise HTTPException(status_code=404, detail="Room not found.")

    # Prevent joining a private room without proper invitation/approval (beyond current scope)
    if room_doc.get("isPrivate") and current_user_uid not in room_doc.get("members", []):
        raise HTTPException(status_code=403, detail="Cannot join a private room without an invite.")

    # Add member to the room's members list
    await db.rooms.update_one({"_id": object_id}, {"$addToSet": {"members": current_user_uid}})
    
    # Update the user's joinedRooms list
    await db.users.update_one(
        {"uid": current_user_uid},
        {"$addToSet": {"joinedRooms": object_id}}
    )

    updated_room = await db.rooms.find_one({"_id": object_id})
    return convert_room_doc_to_model(updated_room, RoomModel)

# --- Leave Room (User Initiated, or Creator Initiated removal) ---
# Re-using / extending existing remove_room_member endpoint for flexibility
@router.delete("/{room_id}/members/{member_uid_to_remove}", status_code=status.HTTP_204_NO_CONTENT,
               summary="Remove a member from a room (can be self-initiated or by creator)")
async def remove_room_member(
    room_id: str,
    member_uid_to_remove: str, # The UID of the member to remove
    current_user_uid: str = Depends(get_current_user_uid)
):
    try:
        object_id = ObjectId(room_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Room ID format.")

    room = await db.rooms.find_one({"_id": object_id})
    if not room:
        raise HTTPException(status_code=404, detail="Room not found.")

    # Authorization logic:
    # 1. User can remove themselves (leave room)
    # 2. Room creator can remove any member
    is_creator = (room['createdBy'] == current_user_uid)
    is_self_removal = (member_uid_to_remove == current_user_uid)

    if not (is_creator or is_self_removal):
        raise HTTPException(status_code=403, detail="Not authorized to remove this member from this room.")
    
    if member_uid_to_remove not in room.get("members", []):
        raise HTTPException(status_code=404, detail="Member not found in room.")

    # Remove member from the room's members list
    await db.rooms.update_one({"_id": object_id}, {"$pull": {"members": member_uid_to_remove}})
    
    # Update the removed member's joinedRooms list
    await db.users.update_one(
        {"uid": member_uid_to_remove},
        {"$pull": {"joinedRooms": object_id}}
    )

    return # 204 No Content


# --- Get Room by ID ---
@router.get("/{room_id}", response_model=RoomModel)
async def get_room_by_id(
    room_id: str,
    current_user_uid: str = Depends(get_current_user_uid) # User needs to be authenticated
):
    try:
        object_id = ObjectId(room_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Room ID format.")

    room_doc = await db.rooms.find_one({"_id": object_id})
    if not room_doc:
        raise HTTPException(status_code=404, detail="Room not found.")
    
    # Authorization: If private, user must be a member
    if room_doc.get("isPrivate") and current_user_uid not in room_doc.get("members", []):
        raise HTTPException(status_code=403, detail="Not authorized to access this private room.")

    return convert_room_doc_to_model(room_doc, RoomModel)

# --- Update Room ---
@router.put("/{room_id}", response_model=RoomModel)
async def update_room(
    room_id: str,
    room_update: RoomModel,
    current_user_uid: str = Depends(get_current_user_uid)
):
    try:
        object_id = ObjectId(room_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Room ID format.")

    existing_room = await db.rooms.find_one({"_id": object_id})
    if not existing_room:
        raise HTTPException(status_code=404, detail="Room not found.")

    # Authorization: Only the creator can update the room details (or specific admins)
    if existing_room['createdBy'] != current_user_uid:
        raise HTTPException(status_code=403, detail="Not authorized to update this room.")

    # Prepare update data: exclude _id, createdBy, createdAt, and unset fields
    update_data = room_update.model_dump(by_alias=True, exclude_unset=True)
    update_data.pop("_id", None)
    update_data.pop("createdBy", None) # Cannot change original creator
    update_data.pop("createdAt", None)
    update_data["lastActivity"] = datetime.now(timezone.utc)  # Update timestamp

    result = await db.rooms.update_one(
        {"_id": object_id},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Room not found.")

    updated_room_doc = await db.rooms.find_one({"_id": object_id})
    if updated_room_doc:
        return convert_room_doc_to_model(updated_room_doc, RoomModel)
    raise HTTPException(status_code=500, detail="Failed to retrieve updated room.")

# --- Delete Room ---
@router.delete("/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_room(
    room_id: str,
    current_user_uid: str = Depends(get_current_user_uid)
):
    try:
        object_id = ObjectId(room_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Room ID format.")

    existing_room = await db.rooms.find_one({"_id": object_id})
    if not existing_room:
        raise HTTPException(status_code=404, detail="Room not found.")

    # Authorization: Only the creator can delete the room
    if existing_room['createdBy'] != current_user_uid:
        raise HTTPException(status_code=403, detail="Not authorized to delete this room.")

    # Optional: Delete all messages associated with this room as well
    await db.messages.delete_many({"roomId": object_id}) # Will assume 'messages' collection exists

    result = await db.rooms.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Room not found.")
    return # No content on successful deletion

# Add this code block to backend/routes/rooms.py
@router.get("/by_user/{user_id}", response_model=List[RoomModel], summary="Get all rooms a specific user is a member of")
async def get_rooms_by_user(
    user_id: str,
    current_user_uid: str = Depends(get_current_user_uid)
):
    # Authorization: Only allow a user to see their own rooms
    if user_id != current_user_uid:
        raise HTTPException(status_code=403, detail="Not authorized to access another user's rooms.")
    
    rooms = []
    # Find rooms where the provided user_id is in the members list
    async for room_doc in db.rooms.find({"members": user_id}):
        rooms.append(convert_room_doc_to_model(room_doc, RoomModel))
    return rooms
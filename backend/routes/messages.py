# backend/routes/messages.py

from fastapi import APIRouter, HTTPException, status, Depends, Query ,WebSocket, WebSocketDisconnect
from typing import List, Optional
from datetime import datetime
from pydantic import ValidationError
import json # For JSON serialization/deserialization for WebSocket messages


from backend.database.mongo import db
from backend.models.messages import MessageModel # Import MessageModel
from backend.models.pyobjectid import PyObjectId # For ID validation
from backend.dependencies import get_current_user_uid , ws_get_current_user_uid # For authentication
from bson import ObjectId

router = APIRouter(
    prefix="/messages",
    tags=["Messages"]
)



# Helper function to convert doc from MongoDB to Pydantic Model
def convert_message_doc_to_model(doc, model_class):
    if doc is None:
        return None
    doc['id'] = str(doc['_id'])
    # roomId is PyObjectId, userId is string - no special conversion needed.
    return model_class.model_validate(doc)

# --- Create Message ---
@router.post("/", response_model=MessageModel, status_code=status.HTTP_201_CREATED)
async def create_message(
    message: MessageModel,
    current_user_uid: str = Depends(get_current_user_uid)
):
    now = datetime.utcnow()
    message.createdAt = now
    message.userId = current_user_uid # Ensure the sender is correctly set by the authenticated user

    # Verify if the roomId exists and the user is a member of that room
    try:
        room_obj_id = ObjectId(message.roomId)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Room ID format.")
    
    room = await db.rooms.find_one({"_id": room_obj_id, "members": current_user_uid})
    if not room:
        raise HTTPException(status_code=404, detail="Room not found or user is not a member of this room.")

    try:
        result = await db.messages.insert_one(message.dict(by_alias=True, exclude_none=True))
        
        # Update lastActivity of the room
        await db.rooms.update_one(
            {"_id": room_obj_id},
            {"$set": {"lastActivity": now}}
        )

        created_message = await db.messages.find_one({"_id": result.inserted_id})
        if created_message:
            return convert_message_doc_to_model(created_message, MessageModel)
        raise HTTPException(status_code=500, detail="Failed to retrieve created message.")
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=f"Validation error: {e.errors()}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create message: {e}")

# --- Get Messages by Room ID (with Pagination) ---
@router.get("/by_room/{room_id}", response_model=List[MessageModel])
async def get_messages_by_room_id(
    room_id: str,
    current_user_uid: str = Depends(get_current_user_uid),
    skip: int = Query(0, ge=0), # For pagination: number of messages to skip
    limit: int = Query(50, ge=1, le=200) # For pagination: number of messages to return
):
    try:
        room_obj_id = ObjectId(room_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Room ID format.")

    # Authorization: User must be a member of the room to view messages
    room = await db.rooms.find_one({"_id": room_obj_id, "members": current_user_uid})
    if not room:
        raise HTTPException(status_code=403, detail="Not authorized to view messages in this room.")

    messages = []
    # Find messages belonging to this room, sorted by creation date ascending
    async for message_doc in db.messages.find({"roomId": room_obj_id})\
                                       .sort("createdAt", 1)\
                                       .skip(skip)\
                                       .limit(limit):
        messages.append(convert_message_doc_to_model(message_doc, MessageModel))
    return messages

# --- WebSocket Connection Manager ---
class ConnectionManager:
    def __init__(self):
        # Dictionary to hold active connections, grouped by room_id
        # Example: { "room_id_1": { "user_id_A": WebSocket, "user_id_B": WebSocket }, ... }
        self.active_connections: dict[str, dict[str, WebSocket]] = {}

    async def connect(self, room_id: str, user_id: str, websocket: WebSocket):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = {}
        self.active_connections[room_id][user_id] = websocket
        # print(f"DEBUG: User {user_id} connected to room {room_id}. Total connections in room: {len(self.active_connections[room_id])}")

    def disconnect(self, room_id: str, user_id: str):
        if room_id in self.active_connections and user_id in self.active_connections[room_id]:
            del self.active_connections[room_id][user_id]
            if not self.active_connections[room_id]: # Remove room entry if no connections left
                del self.active_connections[room_id]
            # print(f"DEBUG: User {user_id} disconnected from room {room_id}.")
            # print(f"DEBUG: Remaining connections in room {room_id}: {len(self.active_connections.get(room_id, {}))}")

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, room_id: str, message: str):
        if room_id in self.active_connections:
            for user_id, connection in list(self.active_connections[room_id].items()): # Use list() for safe iteration during async ops
                try:
                    await connection.send_text(message)
                except RuntimeError as e: # Handle cases where connection might have closed mid-loop
                    # print(f"WARNING: Could not send message to {user_id} in room {room_id}: {e}")
                    self.disconnect(room_id, user_id) # Attempt to clean up
                except Exception as e:
                    # print(f"ERROR: Unexpected error broadcasting to {user_id} in room {room_id}: {e}")
                    self.disconnect(room_id, user_id)


manager = ConnectionManager()

# --- WebSocket Endpoint for Real-time Chat ---
@router.websocket("/ws/{room_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    room_id: str,
    current_user_uid: str = Depends(ws_get_current_user_uid) # Use the WebSocket-specific dependency
):
    # 1. Verify user is a member of the room
    try:
        room_obj_id = ObjectId(room_id)
    except Exception:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Invalid Room ID format.")
        return

    room = await db.rooms.find_one({"_id": room_obj_id, "members": current_user_uid})
    if not room:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Not authorized to access this room.")
        return

    # 2. Add connection to manager
    await manager.connect(room_id, current_user_uid, websocket)
    print(f"User {current_user_uid} connected to room {room_id} via WebSocket.")

    try:
        while True:
            data = await websocket.receive_text() # Listen for incoming text messages

            # 3. Parse and Validate Incoming Message
            try:
                message_data = json.loads(data)
                # Frontend should send content, roomId, etc.
                # We'll construct a MessageModel from the received data
                # Ensure it only contains allowed fields for user input (e.g., 'content')
                message_content = message_data.get("content")
                if not message_content:
                    await websocket.send_text(json.dumps({"error": "Message content is required."}))
                    continue
                
                new_message = MessageModel(
                    roomId=room_id, # This is a PyObjectId, but the string will be converted
                    userId=current_user_uid,
                    content=message_content,
                    createdAt=datetime.utcnow() # Server-side timestamp
                )
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({"error": "Invalid JSON format."}))
                continue
            except ValidationError as e:
                await websocket.send_text(json.dumps({"error": f"Message validation failed: {e.errors()}"}))
                continue

            # 4. Save Message to Database
            try:
                result = await db.messages.insert_one(new_message.dict(by_alias=True, exclude_none=True))
                new_message.id = result.inserted_id # Set the ID from MongoDB
                
                # Update lastActivity of the room
                await db.rooms.update_one(
                    {"_id": room_obj_id},
                    {"$set": {"lastActivity": new_message.createdAt}}
                )
            except Exception as e:
                print(f"ERROR: Failed to save message to DB: {e}")
                await websocket.send_text(json.dumps({"error": "Failed to save message."}))
                continue

            # 5. Broadcast Message to All Connected Clients in the Room
            # Convert the Pydantic model back to a dict/JSON string for broadcasting
            message_to_broadcast = new_message.model_dump_json(by_alias=True)
            await manager.broadcast(room_id, message_to_broadcast)

    except WebSocketDisconnect:
        manager.disconnect(room_id, current_user_uid)
        print(f"User {current_user_uid} disconnected from room {room_id}.")
    except Exception as e:
        print(f"ERROR: WebSocket error for {current_user_uid} in {room_id}: {e}")
        manager.disconnect(room_id, current_user_uid)
        await websocket.close(code=status.WS_1011_INTERNAL_ERROR, reason=f"Server error: {e}")


# --- Delete Message ---
@router.delete("/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_message(
    message_id: str,
    current_user_uid: str = Depends(get_current_user_uid)
):
    try:
        object_id = ObjectId(message_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Message ID format.")

    existing_message = await db.messages.find_one({"_id": object_id})
    if not existing_message:
        raise HTTPException(status_code=404, detail="Message not found.")

    # Authorization: Only the original sender can delete their message
    if existing_message['userId'] != current_user_uid:
        raise HTTPException(status_code=403, detail="Not authorized to delete this message.")

    result = await db.messages.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Message not found.")
    return # No content on successful deletion

# Note: We typically don't allow updating messages in chat apps (or provide an "edit" feature
# that creates a new message with a reference to the old one).
# If an edit feature is needed, it would look similar to post_update.


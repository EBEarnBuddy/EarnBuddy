# backend/models/rooms.py

from typing import List, Optional # Ensure Optional is imported
from pydantic import BaseModel, Field
from datetime import datetime
from backend.models.pyobjectid import PyObjectId # Import PyObjectId

class RoomModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    isPrivate: bool = False
    
    members: List[str] = [] # List of Firebase UIDs of members
    
    # --- CHANGE THIS LINE ---
    createdBy: Optional[str] = None # The backend will set this based on the authenticated user's UID
    # --- END CHANGE ---

    createdAt: Optional[datetime] = None
    lastActivity: Optional[datetime] = None

    hasVideoCall: bool = False
    hasWhiteboard: bool = False
    # --- NEW FIELD FOR TOPICS ---
    topics: List[str] = [] # List of topics (e.g., ["AI/ML", "Web3"])
    # --------------------------

    class Config:
        populate_by_name = True
        json_encoders = {PyObjectId: str, datetime: lambda dt: dt.isoformat()}
        arbitrary_types_allowed = True
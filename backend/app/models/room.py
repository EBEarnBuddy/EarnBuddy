from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from bson import ObjectId

# Simple ObjectId type alias for now
PyObjectId = str

class RoomModel(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={datetime: lambda dt: dt.isoformat()}
    )
    
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    name: str = Field(..., max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    
    # Creator and members
    creatorId: PyObjectId
    creatorName: str = Field(..., max_length=100)
    members: List[PyObjectId] = []
    moderators: List[PyObjectId] = []
    
    # Settings
    isPrivate: bool = False
    isActive: bool = True
    maxMembers: Optional[int] = Field(None, ge=1)
    
    # Stats
    memberCount: int = 0
    messageCount: int = 0
    
    # Timestamps
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None

class RoomCreate(BaseModel):
    name: str = Field(..., max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    isPrivate: bool = False
    maxMembers: Optional[int] = Field(None, ge=1)

class RoomUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    isPrivate: Optional[bool] = None
    isActive: Optional[bool] = None
    maxMembers: Optional[int] = Field(None, ge=1)

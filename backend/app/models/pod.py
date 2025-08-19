from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from bson import ObjectId

# Simple ObjectId type alias for now
PyObjectId = str

class PodModel(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={datetime: lambda dt: dt.isoformat()}
    )
    
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    name: str = Field(..., max_length=100)
    description: str = Field(..., max_length=1000)
    slug: str = Field(..., max_length=100)
    category: str = Field(..., max_length=50)
    tags: List[str] = []
    
    # Media
    coverImage: Optional[str] = ""
    avatar: Optional[str] = ""
    
    # Members and ownership
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
    postCount: int = 0
    viewCount: int = 0
    
    # Timestamps
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None

class PodCreate(BaseModel):
    name: str = Field(..., max_length=100)
    description: str = Field(..., max_length=1000)
    slug: str = Field(..., max_length=100)
    category: str = Field(..., max_length=50)
    tags: Optional[List[str]] = None
    coverImage: Optional[str] = None
    avatar: Optional[str] = None
    isPrivate: bool = False
    maxMembers: Optional[int] = Field(None, ge=1)

class PodUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    category: Optional[str] = Field(None, max_length=50)
    tags: Optional[List[str]] = None
    coverImage: Optional[str] = None
    avatar: Optional[str] = None
    isPrivate: Optional[bool] = None
    isActive: Optional[bool] = None
    maxMembers: Optional[int] = Field(None, ge=1)

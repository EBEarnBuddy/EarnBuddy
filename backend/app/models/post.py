from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from bson import ObjectId

# Simple ObjectId type alias for now
PyObjectId = str

class PostModel(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={datetime: lambda dt: dt.isoformat()}
    )
    
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    content: str = Field(..., max_length=5000)
    title: Optional[str] = Field(None, max_length=200)
    
    # Author
    authorId: PyObjectId
    authorName: str = Field(..., max_length=100)
    authorAvatar: Optional[str] = ""
    
    # Pod association
    podId: PyObjectId
    podName: str = Field(..., max_length=100)
    
    # Media
    images: List[str] = []
    attachments: List[str] = []
    
    # Engagement
    likes: List[PyObjectId] = []
    likeCount: int = 0
    replyCount: int = 0
    viewCount: int = 0
    
    # Type and status
    type: str = Field("post", pattern="^(post|announcement|question|showcase)$")
    isPinned: bool = False
    isEdited: bool = False
    
    # Timestamps
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None

class PostCreate(BaseModel):
    content: str = Field(..., max_length=5000)
    title: Optional[str] = Field(None, max_length=200)
    podId: PyObjectId
    type: str = Field("post", pattern="^(post|announcement|question|showcase)$")
    images: Optional[List[str]] = None
    attachments: Optional[List[str]] = None

class PostUpdate(BaseModel):
    content: Optional[str] = Field(None, max_length=5000)
    title: Optional[str] = Field(None, max_length=200)
    type: Optional[str] = Field(None, pattern="^(post|announcement|question|showcase)$")
    images: Optional[List[str]] = None
    attachments: Optional[List[str]] = None
    isPinned: Optional[bool] = None

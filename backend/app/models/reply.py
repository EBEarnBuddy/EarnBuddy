from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from bson import ObjectId

# Simple ObjectId type alias for now
PyObjectId = str

class ReplyModel(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={datetime: lambda dt: dt.isoformat()}
    )
    
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    content: str = Field(..., max_length=2000)
    
    # Author
    authorId: PyObjectId
    authorName: str = Field(..., max_length=100)
    authorAvatar: Optional[str] = ""
    
    # Post association
    postId: PyObjectId
    
    # Parent reply (for nested replies)
    parentReplyId: Optional[PyObjectId] = None
    
    # Engagement
    likes: List[PyObjectId] = []
    likeCount: int = 0
    
    # Status
    isEdited: bool = False
    
    # Timestamps
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None

class ReplyCreate(BaseModel):
    content: str = Field(..., max_length=2000)
    postId: PyObjectId
    parentReplyId: Optional[PyObjectId] = None

class ReplyUpdate(BaseModel):
    content: Optional[str] = Field(None, max_length=2000)

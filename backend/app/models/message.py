from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from bson import ObjectId

# Simple ObjectId type alias for now
PyObjectId = str

class MessageModel(BaseModel):
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
    
    # Room association
    roomId: PyObjectId
    
    # Message type
    type: str = Field("text", pattern="^(text|image|file|system)$")
    
    # Media
    attachments: List[str] = []
    
    # Status
    isEdited: bool = False
    isDeleted: bool = False
    
    # Read receipts
    readBy: List[PyObjectId] = []
    
    # Timestamps
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None

class MessageCreate(BaseModel):
    content: str = Field(..., max_length=2000)
    roomId: PyObjectId
    type: str = Field("text", pattern="^(text|image|file|system)$")
    attachments: Optional[List[str]] = None

class MessageUpdate(BaseModel):
    content: Optional[str] = Field(None, max_length=2000)
    type: Optional[str] = Field(None, pattern="^(text|image|file|system)$")
    attachments: Optional[List[str]] = None

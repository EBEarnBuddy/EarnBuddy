# backend/models/post.py
from typing import List, Optional
from pydantic import BaseModel, HttpUrl, Field
from datetime import datetime
from backend.models.pyobjectid import PyObjectId # Import PyObjectId

class PostModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None) # MongoDB _id

    userId: str # <--- IMPORTANT: Changed to str (Firebase UID) for consistency
    podId: PyObjectId # The pod this post belongs to (MongoDB _id)

    content: str = Field(...)
    imageUrl: Optional[HttpUrl] = None

    likes: List[str] = [] # <--- IMPORTANT: Changed to List[str] (Firebase UIDs)
    bookmarks: List[str] = [] # <--- IMPORTANT: Changed to List[str] (Firebase UIDs)
    
    createdAt: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updatedAt: Optional[datetime] = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {PyObjectId: str, datetime: lambda dt: dt.isoformat()}
        arbitrary_types_allowed = True
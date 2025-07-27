# backend/models/reply.py
from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime
from backend.models.pyobjectid import PyObjectId # Import PyObjectId

class ReplyModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    postId: PyObjectId # The ID of the post this is a reply to (MongoDB _id)
    userId: str # <--- IMPORTANT: Changed to str (Firebase UID)
    content: str = Field(...)
    createdAt: Optional[datetime] = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {PyObjectId: str, datetime: lambda dt: dt.isoformat()}
        arbitrary_types_allowed = True
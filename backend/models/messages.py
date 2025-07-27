
# backend/models/message.py

from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime
from backend.models.pyobjectid import PyObjectId # Import PyObjectId

class MessageModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None) # MongoDB _id

    roomId: PyObjectId # <--- Reference to the Room this message belongs to (MongoDB ObjectId)
    userId: str # <--- Firebase UID of the user who sent the message
    content: str = Field(...)

    createdAt: Optional[datetime] = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {PyObjectId: str, datetime: lambda dt: dt.isoformat()}
        arbitrary_types_allowed = True
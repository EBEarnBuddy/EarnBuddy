# backend/models/pods.py

from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from backend.models.pyobjectid import PyObjectId # Import PyObjectId

class Event(BaseModel):
    title: str
    description: Optional[str] = ""
    date: Optional[str] = ""
    icon: Optional[str] = ""
    isActive: bool = True
    # If events should have their own ID in MongoDB, add id: Optional[PyObjectId] here
    # and adjust if they are stored in a sub-document or separate collection.

class PinnedResource(BaseModel):
    title: str
    url: str
    type: str

class PodModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None) # MongoDB _id

    name: str = Field(...)
    slug: str = Field(...)
    description: Optional[str] = ""
    theme: Optional[str] = ""

    icon: Optional[str] = ""
    memberCount: int = 0
    members: List[str] = [] # <--- CRUCIAL CHANGE: Changed from PyObjectId to str for Firebase UIDs

    events: List[Event] = []
    pinnedResources: List[PinnedResource] = []
    posts: List[PyObjectId] = [] # post IDs if separated (these are still PyObjectId if they reference actual Post documents' _id)

    isActive: bool = True

    createdAt: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updatedAt: Optional[datetime] = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {PyObjectId: str, datetime: lambda dt: dt.isoformat()}
        arbitrary_types_allowed = True

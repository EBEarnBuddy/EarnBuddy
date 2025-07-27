# backend/models/gigs.py

from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from backend.models.pyobjectid import PyObjectId # Import PyObjectId

class Applicant(BaseModel):
    uid: PyObjectId # User ID who applied
    appliedAt: Optional[datetime] = None

class GigModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None) # MongoDB _id

    title: str = Field(...)
    description: Optional[str] = ""
    budget: Optional[str] = ""
    duration: Optional[str] = ""
    requirements: Optional[List[str]] = []
    tags: Optional[List[str]] = []
    status: str = "open"

    postedBy: PyObjectId # uid of the user who posted

    applicants: List[Applicant] = []
    applicantCount: int = 0

    createdAt: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updatedAt: Optional[datetime] = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {PyObjectId: str, datetime: lambda dt: dt.isoformat()}
        arbitrary_types_allowed = True
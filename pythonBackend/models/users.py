#backend/models/users.py
from typing import List, Optional, Dict
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from pythonBackend.models.pyobjectid import PyObjectId # Import PyObjectId

class OnboardingData(BaseModel):
    availability: Optional[str] = ""
    experience: Optional[str] = ""
    goals: Optional[List[str]] = []
    role: Optional[str] = ""


class UserModel(BaseModel):
    # Add _id mapping for MongoDB
    id: Optional[PyObjectId] = Field(alias="_id", default=None)

    uid: str = Field(...) # Make sure uid is mandatory
    email: EmailStr = Field(...) # Make sure email is mandatory
    displayName: Optional[str] = "Anonymous User"
    photoURL: Optional[str] = ""
    location: Optional[str] = ""

    bio: Optional[str] = ""
    interests: Optional[List[str]] = []
    skills: Optional[List[str]] = []

    rating: float = 0.0
    totalEarnings: Optional[str] = "$0"
    completedProjects: int = 0

    appliedGigs: List[PyObjectId] = [] # These should be ObjectIds if they refer to gig _id
    appliedStartups: List[PyObjectId] = [] # Same here
    bookmarkedGigs: List[PyObjectId] = []
    bookmarkedStartups: List[PyObjectId] = []
    bookmarks: List[PyObjectId] = []

    postedGigs: List[PyObjectId] = []
    postedStartups: List[PyObjectId] = []

    joinedPods: List[PyObjectId] = [] # Pods should be ObjectIds
    joinedRooms: List[PyObjectId] = [] # Rooms should be ObjectIds

    badges: List[str] = []
    activityLog: List[str] = []

    onboardingCompleted: bool = False
    onboardingData: Optional[OnboardingData] = OnboardingData()

    isOnline: Optional[bool] = False
    lastSeen: Optional[datetime] = None
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    joinDate: Optional[datetime] = None

    class Config:
        populate_by_name = True
        json_encoders = {PyObjectId: str, datetime: lambda dt: dt.isoformat()} # Handle ObjectId and datetime
        arbitrary_types_allowed = True
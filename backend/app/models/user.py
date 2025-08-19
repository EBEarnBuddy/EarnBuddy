from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime
from bson import ObjectId

# Simple ObjectId type alias for now
PyObjectId = str

class OnboardingData(BaseModel):
    availability: Optional[str] = ""
    experience: Optional[str] = ""
    goals: Optional[List[str]] = []
    role: Optional[str] = ""

class UserModel(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={datetime: lambda dt: dt.isoformat()}
    )
    
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    uid: Optional[str] = None
    email: EmailStr
    password: Optional[str] = None
    googleId: Optional[str] = None
    firebaseUid: Optional[str] = None
    
    # Profile information
    displayName: str = Field(..., max_length=50)
    firstName: Optional[str] = Field(None, max_length=30)
    lastName: Optional[str] = Field(None, max_length=30)
    photoURL: Optional[str] = ""
    bio: Optional[str] = Field("", max_length=500)
    location: Optional[str] = Field("", max_length=100)
    website: Optional[str] = Field(None, max_length=200)
    github: Optional[str] = Field(None, max_length=200)
    linkedin: Optional[str] = Field(None, max_length=200)
    twitter: Optional[str] = Field(None, max_length=200)
    
    # Skills and interests
    skills: List[str] = []
    interests: List[str] = []
    
    # Professional information
    experience: str = Field("beginner", pattern="^(beginner|intermediate|expert)$")
    role: str = Field("builder", pattern="^(freelancer|founder|builder|investor|student)$")
    availability: Optional[str] = ""
    hourlyRate: Optional[float] = None
    currency: str = "USD"
    
    # Stats
    rating: float = 0.0
    totalEarnings: str = "$0"
    completedProjects: int = 0
    
    # Lists
    appliedGigs: List[PyObjectId] = []
    appliedStartups: List[PyObjectId] = []
    bookmarkedGigs: List[PyObjectId] = []
    bookmarkedStartups: List[PyObjectId] = []
    bookmarks: List[PyObjectId] = []
    postedGigs: List[PyObjectId] = []
    postedStartups: List[PyObjectId] = []
    joinedPods: List[PyObjectId] = []
    joinedRooms: List[PyObjectId] = []
    
    # Activity and status
    badges: List[str] = []
    activityLog: List[Dict[str, Any]] = []
    isOnline: bool = False
    lastSeen: Optional[datetime] = None
    
    # Onboarding
    onboardingCompleted: bool = False
    onboardingData: Optional[OnboardingData] = OnboardingData()
    
    # Timestamps
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    joinDate: Optional[datetime] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: Optional[str] = None
    displayName: str = Field(..., max_length=50)
    firstName: Optional[str] = Field(None, max_length=30)
    lastName: Optional[str] = Field(None, max_length=30)
    uid: Optional[str] = None
    googleId: Optional[str] = None
    firebaseUid: Optional[str] = None

class UserUpdate(BaseModel):
    displayName: Optional[str] = Field(None, max_length=50)
    firstName: Optional[str] = Field(None, max_length=30)
    lastName: Optional[str] = Field(None, max_length=30)
    photoURL: Optional[str] = None
    bio: Optional[str] = Field(None, max_length=500)
    location: Optional[str] = Field(None, max_length=100)
    website: Optional[str] = Field(None, max_length=200)
    github: Optional[str] = Field(None, max_length=200)
    linkedin: Optional[str] = Field(None, max_length=200)
    twitter: Optional[str] = Field(None, max_length=200)
    skills: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    experience: Optional[str] = Field(None, pattern="^(beginner|intermediate|expert)$")
    role: Optional[str] = Field(None, pattern="^(freelancer|founder|builder|investor|student)$")
    availability: Optional[str] = None
    hourlyRate: Optional[float] = None
    currency: Optional[str] = None
    onboardingCompleted: Optional[bool] = None
    onboardingData: Optional[OnboardingData] = None

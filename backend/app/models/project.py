from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from bson import ObjectId

# Simple ObjectId type alias for now
PyObjectId = str

class RoleModel(BaseModel):
    title: str = Field(..., max_length=100)
    description: str = Field(..., max_length=1000)
    experience: str = Field(..., pattern="^(entry|mid|senior|lead)$")
    skills: List[str] = []
    salary: Dict[str, Any] = {
        "min": 0,
        "max": 0,
        "currency": "USD"
    }
    equity: Optional[str] = Field(None, max_length=50)
    benefits: List[str] = []
    priority: str = Field("medium", pattern="^(low|medium|high)$")
    filled: bool = False
    applicants: List[Dict[str, Any]] = []

class ProjectModel(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={datetime: lambda dt: dt.isoformat()}
    )
    
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    
    # Basic project info
    title: str = Field(..., max_length=200)
    description: str = Field(..., max_length=2000)
    company: str = Field(..., max_length=100)
    industry: Optional[str] = Field(None, max_length=100)
    location: Optional[str] = Field(None, max_length=100)
    remote: bool = False
    
    # Project details
    type: str = Field(..., pattern="^(gig|startup|project)$")
    status: str = Field("active", pattern="^(active|paused|completed|cancelled)$")
    priority: str = Field("medium", pattern="^(low|medium|high|urgent)$")
    
    # Budget and compensation
    budget: Optional[Dict[str, Any]] = {
        "min": 0,
        "max": 0,
        "currency": "USD"
    }
    equity: Optional[str] = Field(None, max_length=50)
    benefits: List[str] = []
    
    # Requirements
    skills: List[str] = []
    experience: str = Field("entry", pattern="^(entry|mid|senior|lead)$")
    duration: Optional[str] = Field(None, max_length=50)
    teamSize: Optional[int] = Field(None, ge=1)
    
    # Roles
    roles: List[RoleModel] = []
    
    # Media
    images: List[str] = []
    attachments: List[str] = []
    
    # Author and ownership
    authorId: PyObjectId
    authorName: str = Field(..., max_length=100)
    authorEmail: str
    
    # Applications and engagement
    applications: List[Dict[str, Any]] = []
    applicants: List[PyObjectId] = []
    bookmarks: List[PyObjectId] = []
    views: int = 0
    
    # Timestamps
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    deadline: Optional[datetime] = None
    startDate: Optional[datetime] = None
    endDate: Optional[datetime] = None

class ProjectCreate(BaseModel):
    title: str = Field(..., max_length=200)
    description: str = Field(..., max_length=2000)
    company: str = Field(..., max_length=100)
    industry: Optional[str] = Field(None, max_length=100)
    location: Optional[str] = Field(None, max_length=100)
    remote: bool = False
    type: str = Field(..., pattern="^(gig|startup|project)$")
    priority: str = Field("medium", pattern="^(low|medium|high|urgent)$")
    budget: Optional[Dict[str, Any]] = None
    equity: Optional[str] = Field(None, max_length=50)
    benefits: Optional[List[str]] = None
    skills: Optional[List[str]] = None
    experience: str = Field("entry", pattern="^(entry|mid|senior|lead)$")
    duration: Optional[str] = Field(None, max_length=50)
    teamSize: Optional[int] = Field(None, ge=1)
    roles: Optional[List[RoleModel]] = None
    deadline: Optional[datetime] = None
    startDate: Optional[datetime] = None

class ProjectUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    company: Optional[str] = Field(None, max_length=100)
    industry: Optional[str] = Field(None, max_length=100)
    location: Optional[str] = Field(None, max_length=100)
    remote: Optional[bool] = None
    status: Optional[str] = Field(None, pattern="^(active|paused|completed|cancelled)$")
    priority: Optional[str] = Field(None, pattern="^(low|medium|high|urgent)$")
    budget: Optional[Dict[str, Any]] = None
    equity: Optional[str] = Field(None, max_length=50)
    benefits: Optional[List[str]] = None
    skills: Optional[List[str]] = None
    experience: Optional[str] = Field(None, pattern="^(entry|mid|senior|lead)$")
    duration: Optional[str] = Field(None, max_length=50)
    teamSize: Optional[int] = Field(None, ge=1)
    roles: Optional[List[RoleModel]] = None
    deadline: Optional[datetime] = None
    startDate: Optional[datetime] = None
    endDate: Optional[datetime] = None

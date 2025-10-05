from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from pythonBackend.models.pyobjectid import PyObjectId
from pythonBackend.models.users import UserModel

# --- The full PostModel for representation (what the backend returns) ---
class PostModel(BaseModel):
    id: PyObjectId = Field(alias="_id")
    userId: str 
    podId: PyObjectId 
    type: str = "text"
    content: str
    imageUrl: Optional[str] = None
    hashtags: List[str] = []
    mentions: List[str] = []
    slug: str = Field(...)
    likes: List[str] = []
    bookmarks: List[str] = []
    createdAt: datetime
    updatedAt: datetime
    replies: Optional[List[PyObjectId]] = []

    class Config:
        populate_by_name = True
        json_encoders = {PyObjectId: str, datetime: lambda dt: dt.isoformat()}
        arbitrary_types_allowed = True

# --- The PostCreateModel for post creation (what the frontend sends) ---
class PostCreateModel(BaseModel):
    content: str = Field(...)
    podId: PyObjectId
    slug: str = Field(...)
    hashtags: List[str] = []
    mentions: List[str] = []
    type: str = "text"
    imageUrl: Optional[str] = None

    class Config:
        populate_by_name = True
        json_encoders = {PyObjectId: str}
        arbitrary_types_allowed = True

# New model to represent a post with the associated user for the frontend
class PostWithUser(BaseModel):
    post: PostModel
    user: Optional[UserModel] = None

PostWithUser.model_rebuild()
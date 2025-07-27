# backend/routes/pods.py

from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from datetime import datetime
from pydantic import ValidationError # Keep ValidationError for Pydantic issues

from backend.database.mongo import db
from backend.models.pods import PodModel, Event, PinnedResource # Import all models
from backend.models.pyobjectid import PyObjectId # For ID validation
from backend.dependencies import get_current_user_uid # Assuming you have this for authentication
from pymongo.errors import DuplicateKeyError
from bson import ObjectId # Only use for _id conversions, not for Firebase UIDs

router = APIRouter(
    prefix="/pods",
    tags=["Pods"]
)

# Helper function to convert doc from MongoDB to Pydantic Model
def convert_doc_to_model(doc, model_class):
    if doc is None:
        return None
    doc['id'] = str(doc['_id'])
    # 'members' are now strings, no conversion needed here.
    # 'posts' might still be PyObjectId references, so convert them to string if present.
    if 'posts' in doc and isinstance(doc['posts'], list):
        doc['posts'] = [str(post_id) for post_id in doc['posts']]
    return model_class.model_validate(doc)

# --- Create Pod ---
@router.post("/", response_model=PodModel, status_code=status.HTTP_201_CREATED)
async def create_pod(
    pod: PodModel,
    current_user_uid: str = Depends(get_current_user_uid) # Protect this route
):
    now = datetime.utcnow()
    pod.createdAt = now
    pod.updatedAt = now
    
    # Ensure the creating user's Firebase UID is added to members if not already present
    if current_user_uid not in pod.members:
        pod.members.append(current_user_uid) # Directly append the string UID

    try:
        # Pydantic's .dict(by_alias=True, exclude_none=True) prepares for MongoDB
        result = await db.pods.insert_one(pod.dict(by_alias=True, exclude_none=True))
        created_pod = await db.pods.find_one({"_id": result.inserted_id})
        if created_pod:
            return convert_doc_to_model(created_pod, PodModel)
        raise HTTPException(status_code=500, detail="Failed to retrieve created pod.")
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="Pod with this slug already exists.")
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=f"Validation error: {e.errors()}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create pod: {e}")

# --- Get All Pods ---
@router.get("/", response_model=List[PodModel])
async def get_all_pods():
    pods = []
    async for pod_doc in db.pods.find():
        pods.append(convert_doc_to_model(pod_doc, PodModel))
    return pods

# --- Get Pod by ID ---
@router.get("/{pod_id}", response_model=PodModel)
async def get_pod_by_id(pod_id: str):
    try:
        # Convert string ID from URL to MongoDB ObjectId for query
        object_id = ObjectId(pod_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Pod ID format.")

    pod_doc = await db.pods.find_one({"_id": object_id})
    if pod_doc:
        return convert_doc_to_model(pod_doc, PodModel)
    raise HTTPException(status_code=404, detail="Pod not found.")

# --- Update Pod ---
@router.put("/{pod_id}", response_model=PodModel)
async def update_pod(
    pod_id: str,
    pod: PodModel,
    current_user_uid: str = Depends(get_current_user_uid) # Protect this route
):
    try:
        object_id = ObjectId(pod_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Pod ID format.")

    # Prevent changing _id and createdAt
    # .model_dump(by_alias=True, exclude_unset=True) is the modern Pydantic v2 way
    update_data = pod.model_dump(by_alias=True, exclude_unset=True)
    update_data.pop("_id", None)
    update_data.pop("createdAt", None)
    update_data["updatedAt"] = datetime.utcnow() # Update timestamp

    result = await db.pods.update_one(
        {"_id": object_id},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Pod not found.")

    updated_pod_doc = await db.pods.find_one({"_id": object_id})
    if updated_pod_doc:
        return convert_doc_to_model(updated_pod_doc, PodModel)
    raise HTTPException(status_code=500, detail="Failed to retrieve updated pod.")

# --- Delete Pod ---
@router.delete("/{pod_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pod(
    pod_id: str,
    current_user_uid: str = Depends(get_current_user_uid) # Protect this route
):
    try:
        object_id = ObjectId(pod_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Pod ID format.")

    result = await db.pods.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Pod not found.")
    return # No content on successful deletion
# backend/routes/pods.py

from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from datetime import datetime
from pydantic import ValidationError

from pythonBackend.database.mongo import db
from pythonBackend.models.pods import PodModel, Event, PinnedResource
from pythonBackend.models.pyobjectid import PyObjectId
from pythonBackend.dependencies import get_current_user_uid
from pymongo.errors import DuplicateKeyError
from bson import ObjectId

router = APIRouter(
    prefix="/pods",
    tags=["Pods"]
)

# Helper function to convert doc from MongoDB to Pydantic Model
def convert_doc_to_model(doc, model_class):
    if doc is None:
        return None
    doc['id'] = str(doc['_id'])
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            doc[key] = str(value)
        elif isinstance(value, list) and all(isinstance(item, ObjectId) for item in value):
            doc[key] = [str(item) for item in value]
    return model_class.model_validate(doc)

# --- Create Pod ---
@router.post("/", response_model=PodModel, status_code=status.HTTP_201_CREATED)
async def create_pod(
    pod: PodModel,
    current_user_uid: str = Depends(get_current_user_uid)
):
    now = datetime.utcnow()
    pod.createdAt = now
    pod.updatedAt = now
    pod.createdBy = current_user_uid # Store the creator's UID
    
    if current_user_uid not in pod.members:
        pod.members.append(current_user_uid)
    
    pod.memberCount = len(pod.members)

    try:
        pod_dict = pod.model_dump(by_alias=True, exclude_none=True)
        result = await db.pods.insert_one(pod_dict)
        created_pod = await db.pods.find_one({"_id": result.inserted_id})
        
        if created_pod:
            # Update the user's joinedPods list
            await db.users.update_one(
                {"uid": current_user_uid},
                {"$addToSet": {"joinedPods": created_pod['_id']}}
            )
            return convert_doc_to_model(created_pod, PodModel)
        raise HTTPException(status_code=500, detail="Failed to retrieve created pod.")
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="Pod with this slug already exists.")
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=f"Validation error: {e.errors()}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create pod: {e}")

# --- Get Pods the User is a Member of ---
@router.get("/my", response_model=List[PodModel], summary="Get pods a user is a member of")
async def get_my_pods(current_user_uid: str = Depends(get_current_user_uid)):
    pods = []
    async for pod_doc in db.pods.find({"members": current_user_uid}):
        pods.append(convert_doc_to_model(pod_doc, PodModel))
    return pods

# --- Get Pod by ID ---
@router.get("/{pod_id}", response_model=PodModel)
async def get_pod_by_id(pod_id: str, current_user_uid: str = Depends(get_current_user_uid)):
    try:
        object_id = ObjectId(pod_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Pod ID format.")

    pod_doc = await db.pods.find_one({"_id": object_id})
    if not pod_doc:
        raise HTTPException(status_code=404, detail="Pod not found.")

    # Authorization: User must be a member to view the pod
    if pod_doc.get("isPrivate", False) and current_user_uid not in pod_doc.get("members", []):
        raise HTTPException(status_code=403, detail="Not authorized to access this pod.")
    
    return convert_doc_to_model(pod_doc, PodModel)

# --- Join Pod ---
@router.post("/{pod_id}/join", response_model=PodModel)
async def join_pod(pod_id: str, current_user_uid: str = Depends(get_current_user_uid)):
    try:
        object_id = ObjectId(pod_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Pod ID format.")

    pod = await db.pods.find_one({"_id": object_id})
    if not pod:
        raise HTTPException(status_code=404, detail="Pod not found.")

    # Check if the pod is private
    if pod.get("isPrivate", False) and current_user_uid not in pod.get("invitedMembers", []):
        raise HTTPException(status_code=403, detail="Cannot join a private pod without an invitation.")
    
    # Update pod members
    result = await db.pods.update_one(
        {"_id": object_id},
        {"$addToSet": {"members": current_user_uid}, "$inc": {"memberCount": 1}}
    )
    # Update user's joined pods
    await db.users.update_one(
        {"uid": current_user_uid},
        {"$addToSet": {"joinedPods": object_id}}
    )
    
    updated_pod_doc = await db.pods.find_one({"_id": object_id})
    return convert_doc_to_model(updated_pod_doc, PodModel)

# --- Leave Pod ---
@router.post("/{pod_id}/leave", status_code=status.HTTP_204_NO_CONTENT)
async def leave_pod(pod_id: str, current_user_uid: str = Depends(get_current_user_uid)):
    try:
        object_id = ObjectId(pod_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Pod ID format.")

    pod = await db.pods.find_one({"_id": object_id})
    if not pod:
        raise HTTPException(status_code=404, detail="Pod not found.")
        
    # User cannot leave a pod if they are the creator
    if pod.get("createdBy") == current_user_uid:
        raise HTTPException(status_code=403, detail="The creator cannot leave the pod. They must delete it.")
    
    # Update pod members
    await db.pods.update_one(
        {"_id": object_id},
        {"$pull": {"members": current_user_uid}, "$inc": {"memberCount": -1}}
    )
    # Update user's joined pods
    await db.users.update_one(
        {"uid": current_user_uid},
        {"$pull": {"joinedPods": object_id}}
    )

# --- Update Pod ---
@router.put("/{pod_id}", response_model=PodModel)
async def update_pod(
    pod_id: str,
    pod_update: PodModel,
    current_user_uid: str = Depends(get_current_user_uid)
):
    try:
        object_id = ObjectId(pod_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Pod ID format.")

    existing_pod = await db.pods.find_one({"_id": object_id})
    if not existing_pod:
        raise HTTPException(status_code=404, detail="Pod not found.")
    
    # Authorization: Only the creator can update
    if existing_pod.get('createdBy') != current_user_uid:
        raise HTTPException(status_code=403, detail="Not authorized to update this pod.")
    
    update_data = pod_update.model_dump(by_alias=True, exclude_unset=True)
    update_data.pop("_id", None)
    update_data.pop("createdBy", None)
    update_data.pop("createdAt", None)
    update_data["updatedAt"] = datetime.utcnow()

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
    current_user_uid: str = Depends(get_current_user_uid)
):
    try:
        object_id = ObjectId(pod_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Pod ID format.")

    existing_pod = await db.pods.find_one({"_id": object_id})
    if not existing_pod:
        raise HTTPException(status_code=404, detail="Pod not found.")

    # Authorization: Only the creator can delete
    if existing_pod.get('createdBy') != current_user_uid:
        raise HTTPException(status_code=403, detail="Not authorized to delete this pod.")

    # Optional: Delete all associated posts and replies within this pod
    post_ids_to_delete = []
    async for post_doc in db.posts.find({"podId": object_id}, {"_id": 1}):
        post_ids_to_delete.append(post_doc['_id'])

    if post_ids_to_delete:
        await db.replies.delete_many({"postId": {"$in": post_ids_to_delete}})
        await db.posts.delete_many({"_id": {"$in": post_ids_to_delete}})

    result = await db.pods.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Pod not found.")
    
    # Remove the pod from all members' joinedPods list
    await db.users.update_many(
        {"joinedPods": object_id},
        {"$pull": {"joinedPods": object_id}}
    )
    
    return

# --- Invite User to a Pod ---
# Assuming a separate User model with 'email' field exists.
# This is a simplified version; a real-world scenario would involve sending an email.
@router.post("/{pod_id}/invite", status_code=status.HTTP_200_OK)
async def invite_user_to_pod(
    pod_id: str,
    email: str,
    current_user_uid: str = Depends(get_current_user_uid)
):
    try:
        object_id = ObjectId(pod_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Pod ID format.")
    
    pod = await db.pods.find_one({"_id": object_id})
    if not pod:
        raise HTTPException(status_code=404, detail="Pod not found.")
    
    # Authorization: Only the pod creator can invite users
    if pod.get('createdBy') != current_user_uid:
        raise HTTPException(status_code=403, detail="Not authorized to invite users to this pod.")

    # Check if the user to be invited exists
    invited_user = await db.users.find_one({"email": email})
    if not invited_user:
        raise HTTPException(status_code=404, detail="User with that email not found.")
    
    # Add the user to the pod's members list and update count
    await db.pods.update_one(
        {"_id": object_id},
        {"$addToSet": {"members": invited_user['uid']}, "$inc": {"memberCount": 1}}
    )
    
    # Add the pod to the invited user's joinedPods list
    await db.users.update_one(
        {"uid": invited_user['uid']},
        {"$addToSet": {"joinedPods": object_id}}
    )
    
    return {"message": f"User with email {email} has been added to the pod."}

# --- Get All Public Pods ---
@router.get("/", response_model=List[PodModel], summary="Get all public pods")
async def get_all_pods():
    pods = []
    async for pod_doc in db.pods.find({"isPrivate": False}):
        pods.append(convert_doc_to_model(pod_doc, PodModel))
    return pods
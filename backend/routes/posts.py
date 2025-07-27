# backend/routes/posts.py

from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from datetime import datetime
from pydantic import ValidationError, HttpUrl # Import HttpUrl for validation if needed
from pymongo.errors import DuplicateKeyError

from backend.database.mongo import db
from backend.models.posts import PostModel # Import PostModel
from backend.models.pyobjectid import PyObjectId # For ID validation
from backend.dependencies import get_current_user_uid # For authentication
from bson import ObjectId # For converting string IDs to MongoDB's ObjectId

router = APIRouter(
    prefix="/posts",
    tags=["Posts"]
)

# Helper function to convert doc from MongoDB to Pydantic Model
def convert_post_doc_to_model(doc, model_class):
    if doc is None:
        return None
    doc['id'] = str(doc['_id'])
    # podId is PyObjectId, userId, likes, bookmarks are strings - no special conversion needed for them
    return model_class.model_validate(doc)

# --- Create Post ---
@router.post("/", response_model=PostModel, status_code=status.HTTP_201_CREATED)
async def create_post(
    post: PostModel,
    current_user_uid: str = Depends(get_current_user_uid)
):
    now = datetime.utcnow()
    post.createdAt = now
    post.updatedAt = now
    post.userId = current_user_uid # Ensure the creator is correctly set by the authenticated user

    # Optional: Verify if the podId exists and the user is a member of that pod
    try:
        pod_obj_id = ObjectId(post.podId) # Convert PyObjectId to ObjectId for DB query
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Pod ID format.")
    
    # Check if pod exists and user is a member of that pod
    pod = await db.pods.find_one({"_id": pod_obj_id, "members": current_user_uid})
    if not pod:
        raise HTTPException(status_code=404, detail="Pod not found or user is not a member of this pod.")


    try:
        result = await db.posts.insert_one(post.dict(by_alias=True, exclude_none=True))
        created_post = await db.posts.find_one({"_id": result.inserted_id})
        if created_post:
            return convert_post_doc_to_model(created_post, PostModel)
        raise HTTPException(status_code=500, detail="Failed to retrieve created post.")
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=f"Validation error: {e.errors()}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create post: {e}")

# --- Get Posts by Pod ID ---
@router.get("/by_pod/{pod_id}", response_model=List[PostModel])
async def get_posts_by_pod_id(
    pod_id: str,
    current_user_uid: str = Depends(get_current_user_uid) # Ensure user is authenticated to view posts
):
    try:
        pod_obj_id = ObjectId(pod_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Pod ID format.")

    # Optional: Check if the user is a member of the pod to view its posts
    pod = await db.pods.find_one({"_id": pod_obj_id, "members": current_user_uid})
    if not pod:
        raise HTTPException(status_code=403, detail="Not authorized to view posts in this pod.")

    posts = []
    # Find posts belonging to this pod, sorted by creation date descending
    async for post_doc in db.posts.find({"podId": pod_obj_id}).sort("createdAt", -1):
        posts.append(convert_post_doc_to_model(post_doc, PostModel))
    return posts

# --- Get Post by ID ---
@router.get("/{post_id}", response_model=PostModel)
async def get_post_by_id(
    post_id: str,
    current_user_uid: str = Depends(get_current_user_uid) # Ensure user is authenticated
):
    try:
        object_id = ObjectId(post_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Post ID format.")

    post_doc = await db.posts.find_one({"_id": object_id})
    if not post_doc:
        raise HTTPException(status_code=404, detail="Post not found.")
    
    # Optional: Check if the user is a member of the post's pod
    pod_id = post_doc['podId']
    pod = await db.pods.find_one({"_id": pod_id, "members": current_user_uid})
    if not pod:
        raise HTTPException(status_code=403, detail="Not authorized to view this post.")

    return convert_post_doc_to_model(post_doc, PostModel)

# --- Update Post ---
@router.put("/{post_id}", response_model=PostModel)
async def update_post(
    post_id: str,
    post_update: PostModel, # Using PostModel for update, can create a dedicated UpdatePostModel if fields are minimal
    current_user_uid: str = Depends(get_current_user_uid)
):
    try:
        object_id = ObjectId(post_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Post ID format.")

    existing_post = await db.posts.find_one({"_id": object_id})
    if not existing_post:
        raise HTTPException(status_code=404, detail="Post not found.")

    # Authorization: Only the original poster can update
    if existing_post['userId'] != current_user_uid:
        raise HTTPException(status_code=403, detail="Not authorized to update this post.")

    # Prepare update data: exclude _id, userId, podId, createdAt, and unset fields
    update_data = post_update.model_dump(by_alias=True, exclude_unset=True)
    update_data.pop("_id", None)
    update_data.pop("userId", None) # Cannot change original poster
    update_data.pop("podId", None) # Cannot change pod of a post
    update_data.pop("createdAt", None)
    update_data["updatedAt"] = datetime.utcnow() # Update timestamp

    result = await db.posts.update_one(
        {"_id": object_id},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Post not found.")

    updated_post_doc = await db.posts.find_one({"_id": object_id})
    if updated_post_doc:
        return convert_post_doc_to_model(updated_post_doc, PostModel)
    raise HTTPException(status_code=500, detail="Failed to retrieve updated post.")

# --- Delete Post ---
@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: str,
    current_user_uid: str = Depends(get_current_user_uid)
):
    try:
        object_id = ObjectId(post_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Post ID format.")

    existing_post = await db.posts.find_one({"_id": object_id})
    if not existing_post:
        raise HTTPException(status_code=404, detail="Post not found.")

    # Authorization: Only the original poster OR a pod admin can delete
    # For simplicity, let's allow only the poster for now. Add pod admin check later if needed.
    if existing_post['userId'] != current_user_uid:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post.")

    # Optional: Delete all replies associated with this post as well
    await db.replies.delete_many({"postId": object_id})

    result = await db.posts.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found.")
    return # No content on successful deletion

# --- Like/Unlike Post ---
@router.post("/{post_id}/like", response_model=PostModel)
async def like_unlike_post(
    post_id: str,
    current_user_uid: str = Depends(get_current_user_uid)
):
    try:
        object_id = ObjectId(post_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Post ID format.")

    post = await db.posts.find_one({"_id": object_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")

    # Check if the user is already in the likes list
    if current_user_uid in post.get("likes", []):
        # User has already liked, so unlike (pull from array)
        await db.posts.update_one({"_id": object_id}, {"$pull": {"likes": current_user_uid}})
    else:
        # User has not liked, so like (push to array)
        await db.posts.update_one({"_id": object_id}, {"$push": {"likes": current_user_uid}})
    
    updated_post_doc = await db.posts.find_one({"_id": object_id})
    if updated_post_doc:
        return convert_post_doc_to_model(updated_post_doc, PostModel)
    raise HTTPException(status_code=500, detail="Failed to retrieve updated post.")


# --- Bookmark/Unbookmark Post ---
@router.post("/{post_id}/bookmark", response_model=PostModel)
async def bookmark_unbookmark_post(
    post_id: str,
    current_user_uid: str = Depends(get_current_user_uid)
):
    try:
        object_id = ObjectId(post_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Post ID format.")

    post = await db.posts.find_one({"_id": object_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")

    # Check if the user is already in the bookmarks list
    if current_user_uid in post.get("bookmarks", []):
        # User has already bookmarked, so unbookmark (pull from array)
        await db.posts.update_one({"_id": object_id}, {"$pull": {"bookmarks": current_user_uid}})
    else:
        # User has not bookmarked, so bookmark (push to array)
        await db.posts.update_one({"_id": object_id}, {"$push": {"bookmarks": current_user_uid}})
    
    updated_post_doc = await db.posts.find_one({"_id": object_id})
    if updated_post_doc:
        return convert_post_doc_to_model(updated_post_doc, PostModel)
    raise HTTPException(status_code=500, detail="Failed to retrieve updated post.")
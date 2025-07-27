# backend/routes/reply.py

from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from datetime import datetime
from pydantic import ValidationError

from backend.database.mongo import db
from backend.models.reply import ReplyModel # Import ReplyModel
from backend.models.pyobjectid import PyObjectId # For ID validation
from backend.dependencies import get_current_user_uid # For authentication
from bson import ObjectId # For converting string IDs to MongoDB's ObjectId

router = APIRouter(
    prefix="/replies",
    tags=["Replies"]
)

# Helper function to convert doc from MongoDB to Pydantic Model
def convert_reply_doc_to_model(doc, model_class):
    if doc is None:
        return None
    doc['id'] = str(doc['_id'])
    # postId is PyObjectId, userId is string - no special conversion needed for them
    return model_class.model_validate(doc)

# --- Create Reply ---
@router.post("/", response_model=ReplyModel, status_code=status.HTTP_201_CREATED)
async def create_reply(
    reply: ReplyModel,
    current_user_uid: str = Depends(get_current_user_uid)
):
    now = datetime.utcnow()
    reply.createdAt = now
    reply.userId = current_user_uid # Ensure the creator is correctly set by the authenticated user

    # Optional: Verify if the postId exists
    try:
        post_obj_id = ObjectId(reply.postId)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Post ID format.")
    
    post = await db.posts.find_one({"_id": post_obj_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found for this reply.")

    try:
        result = await db.replies.insert_one(reply.dict(by_alias=True, exclude_none=True))
        created_reply = await db.replies.find_one({"_id": result.inserted_id})
        if created_reply:
            return convert_reply_doc_to_model(created_reply, ReplyModel)
        raise HTTPException(status_code=500, detail="Failed to retrieve created reply.")
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=f"Validation error: {e.errors()}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create reply: {e}")

# --- Get Replies by Post ID ---
@router.get("/by_post/{post_id}", response_model=List[ReplyModel])
async def get_replies_by_post_id(
    post_id: str,
    current_user_uid: str = Depends(get_current_user_uid) # User needs to be authenticated to view replies
):
    try:
        post_obj_id = ObjectId(post_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Post ID format.")

    # Optional: Check if the post exists and user is authorized to view it (e.g., is member of the pod)
    # This might require fetching the post, then checking the pod. For simplicity, we just check post existence for now.
    post = await db.posts.find_one({"_id": post_obj_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")
    
    # You might want to add a check here: Does the current_user_uid have access to the pod of this post?
    # This would involve getting the post's podId, then checking the 'members' of that pod.
    # For now, we assume if you can see the post, you can see replies.

    replies = []
    # Find replies belonging to this post, sorted by creation date ascending
    async for reply_doc in db.replies.find({"postId": post_obj_id}).sort("createdAt", 1):
        replies.append(convert_reply_doc_to_model(reply_doc, ReplyModel))
    return replies

# --- Delete Reply ---
@router.delete("/{reply_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_reply(
    reply_id: str,
    current_user_uid: str = Depends(get_current_user_uid)
):
    try:
        object_id = ObjectId(reply_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Reply ID format.")

    existing_reply = await db.replies.find_one({"_id": object_id})
    if not existing_reply:
        raise HTTPException(status_code=404, detail="Reply not found.")

    # Authorization: Only the original replier can delete
    if existing_reply['userId'] != current_user_uid:
        raise HTTPException(status_code=403, detail="Not authorized to delete this reply.")

    result = await db.replies.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Reply not found.")
    return # No content on successful deletion
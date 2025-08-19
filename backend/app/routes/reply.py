from fastapi import APIRouter, HTTPException, status, Depends
from app.database.mongo import db
from app.models.reply import ReplyModel, ReplyCreate, ReplyUpdate
from app.middleware.auth import get_current_user
from datetime import datetime
from bson import ObjectId

router = APIRouter()

@router.post("/")
async def create_reply(
    reply_data: ReplyCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new reply."""
    try:
        # Check if post exists
        post = await db.posts.find_one({"_id": ObjectId(reply_data.postId)})
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post not found"
            )
            
        reply_obj = ReplyModel(
            **reply_data.model_dump(),
            authorId=current_user["_id"],
            authorName=current_user.get("displayName", "Anonymous"),
            authorAvatar=current_user.get("photoURL", ""),
            createdAt=datetime.utcnow(),
            updatedAt=datetime.utcnow()
        )
        
        reply_doc = reply_obj.model_dump(by_alias=True, exclude_none=True)
        reply_doc["_id"] = ObjectId()
        
        await db.replies.insert_one(reply_doc)
        
        # Increment post reply count
        await db.posts.update_one(
            {"_id": ObjectId(reply_data.postId)},
            {"$inc": {"replyCount": 1}}
        )
        
        return {
            "success": True,
            "message": "Reply created successfully",
            "data": {"reply": reply_doc}
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create reply: {str(e)}"
        )

@router.get("/{post_id}")
async def get_replies(post_id: str):
    """Get replies for a specific post."""
    try:
        if not ObjectId.is_valid(post_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid post ID"
            )
            
        cursor = db.replies.find({"postId": ObjectId(post_id)}).sort("createdAt", 1)
        replies = await cursor.to_list(length=None)
        
        return {
            "success": True,
            "data": {"replies": replies}
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch replies: {str(e)}"
        )

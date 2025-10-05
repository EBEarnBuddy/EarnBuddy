import os
import json
from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Form
from typing import List, Optional
from datetime import datetime
from pydantic import ValidationError
from bson import ObjectId
import asyncio
import aiofiles

from pythonBackend.database.mongo import db
from pythonBackend.models.posts import PostModel, PostCreateModel, PostWithUser
from pythonBackend.models.users import UserModel
from pythonBackend.dependencies import get_current_user_uid

router = APIRouter(
    prefix="/posts",
    tags=["Posts"]
)

# Helper function to convert doc from MongoDB to Pydantic Model
def convert_post_doc_to_model(doc, model_class):
    if doc is None:
        return None
    doc['id'] = str(doc['_id'])
    doc['podId'] = str(doc['podId'])
    return model_class.model_validate(doc)

# Helper to fetch user details for a given post
async def fetch_user_for_post(post_doc):
    user_doc = await db.users.find_one({"uid": post_doc['userId']})
    if user_doc:
        user_doc['id'] = str(user_doc['_id'])
        return UserModel.model_validate(user_doc)
    return None

# --- Create Post ---
@router.post("/", response_model=PostWithUser, status_code=status.HTTP_201_CREATED)
async def create_post(
    content: str = Form(...),
    podId: str = Form(...),
    slug: str = Form(...),
    hashtags: str = Form("[]"),
    mentions: str = Form("[]"),
    type: str = Form(...),
    image: Optional[UploadFile] = File(None),
    current_user_uid: str = Depends(get_current_user_uid)
):
    now = datetime.utcnow()
    
    try:
        hashtags_list = json.loads(hashtags)
        mentions_list = json.loads(mentions)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid format for hashtags or mentions.")

    image_url = None
    if image:
        upload_folder = "static/images"
        os.makedirs(upload_folder, exist_ok=True)
        file_path = os.path.join(upload_folder, image.filename)
        
        async with aiofiles.open(file_path, "wb") as f:
            await f.write(await image.read())
            
        image_url = f"http://127.0.0.1:8000/static/images/{image.filename}"

    post_doc = {
        "userId": current_user_uid,
        "podId": ObjectId(podId),
        "content": content,
        "slug": slug,
        "hashtags": hashtags_list,
        "mentions": mentions_list,
        "type": type,
        "imageUrl": image_url,
        "createdAt": now,
        "updatedAt": now,
        "likes": [],
        "bookmarks": [],
        "replies": [],
    }

    try:
        pod_obj_id = ObjectId(podId)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Pod ID format.")

    pod = await db.pods.find_one({"_id": pod_obj_id})
    if not pod:
        raise HTTPException(status_code=404, detail="Pod not found.")
    
    if current_user_uid not in pod.get("members", []):
        raise HTTPException(status_code=403, detail="Not authorized to post in this pod.")

    try:
        result = await db.posts.insert_one(post_doc)
        created_post = await db.posts.find_one({"_id": result.inserted_id})
        
        if created_post:
            await db.pods.update_one(
                {"_id": pod_obj_id},
                {"$addToSet": {"posts": created_post['_id']}}
            )
            
            user = await fetch_user_for_post(created_post)
            if user:
                return PostWithUser(post=convert_post_doc_to_model(created_post, PostModel), user=user)
            else:
                return PostWithUser(post=convert_post_doc_to_model(created_post, PostModel), user=None)

        raise HTTPException(status_code=500, detail="Failed to retrieve created post.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create post: {e}")

# --- Get Posts by Pod ID ---
@router.get("/by_pod/{pod_id}", response_model=List[PostWithUser])
async def get_posts_by_pod_id(
    pod_id: str,
    current_user_uid: str = Depends(get_current_user_uid)
):
    try:
        pod_obj_id = ObjectId(pod_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Pod ID format.")

    pod = await db.pods.find_one({"_id": pod_obj_id})
    if not pod:
        raise HTTPException(status_code=404, detail="Pod not found.")
    if pod.get("isPrivate") and current_user_uid not in pod.get("members", []):
        raise HTTPException(status_code=403, detail="Not authorized to view this pod's posts.")

    posts = []
    post_docs = []
    
    async for post_doc in db.posts.find({"podId": pod_obj_id}).sort("createdAt", -1):
        post_docs.append(post_doc)
    
    user_ids = list(set([doc['userId'] for doc in post_docs]))
    
    users_cursor = db.users.find({"uid": {"$in": user_ids}})
    users_map = {doc['uid']: UserModel.model_validate(doc) for doc in await users_cursor.to_list(length=None)}
    
    for post_doc in post_docs:
        user = users_map.get(post_doc['userId'])
        posts.append(
            PostWithUser(
                post=convert_post_doc_to_model(post_doc, PostModel),
                user=user
            )
        )
    
    return posts

# --- Get Single Post by ID ---
@router.get("/{post_id}", response_model=PostWithUser)
async def get_post_by_id(post_id: str, current_user_uid: str = Depends(get_current_user_uid)):
    try:
        object_id = ObjectId(post_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Post ID format.")
    
    post_doc = await db.posts.find_one({"_id": object_id})
    if not post_doc:
        raise HTTPException(status_code=404, detail="Post not found.")
    
    pod_doc = await db.pods.find_one({"_id": post_doc['podId']})
    if pod_doc and pod_doc.get("isPrivate") and current_user_uid not in pod_doc.get("members", []):
        raise HTTPException(status_code=403, detail="Not authorized to view this post.")

    user = await fetch_user_for_post(post_doc)
    return PostWithUser(post=convert_post_doc_to_model(post_doc, PostModel), user=user)

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

    if existing_post['userId'] != current_user_uid:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post.")

    result = await db.posts.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found.")
    
    await db.pods.update_one(
        {"_id": existing_post['podId']},
        {"$pull": {"posts": existing_post['_id']}}
    )
    
    return

# --- Like/Unlike Post ---
@router.post("/{post_id}/like", response_model=PostWithUser)
async def like_unlike_post(
    post_id: str,
    current_user_uid: str = Depends(get_current_user_uid)
):
    if not post_id or post_id == "undefined":
        raise HTTPException(status_code=400, detail="Invalid Post ID format.")
    
    try:
        object_id = ObjectId(post_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Post ID format.")

    post = await db.posts.find_one({"_id": object_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")

    if current_user_uid in post.get("likes", []):
        await db.posts.update_one({"_id": object_id}, {"$pull": {"likes": current_user_uid}})
    else:
        await db.posts.update_one({"_id": object_id}, {"$push": {"likes": current_user_uid}})
    
    updated_post_doc = await db.posts.find_one({"_id": object_id})
    if updated_post_doc:
        user = await fetch_user_for_post(updated_post_doc)
        return PostWithUser(post=convert_post_doc_to_model(updated_post_doc, PostModel), user=user)
    raise HTTPException(status_code=500, detail="Failed to retrieve updated post.")

# --- Bookmark/Unbookmark Post ---
@router.post("/{post_id}/bookmark", response_model=PostWithUser)
async def bookmark_unbookmark_post(
    post_id: str,
    current_user_uid: str = Depends(get_current_user_uid)
):
    if not post_id or post_id == "undefined":
        raise HTTPException(status_code=400, detail="Invalid Post ID format.")
    
    try:
        object_id = ObjectId(post_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Post ID format.")

    post = await db.posts.find_one({"_id": object_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")

    if current_user_uid in post.get("bookmarks", []):
        await db.posts.update_one({"_id": object_id}, {"$pull": {"bookmarks": current_user_uid}})
    else:
        await db.posts.update_one({"_id": object_id}, {"$push": {"bookmarks": current_user_uid}})
    
    updated_post_doc = await db.posts.find_one({"_id": object_id})
    if updated_post_doc:
        user = await fetch_user_for_post(updated_post_doc)
        return PostWithUser(post=convert_post_doc_to_model(updated_post_doc, PostModel), user=user)
    raise HTTPException(status_code=500, detail="Failed to retrieve updated post.")
from fastapi import APIRouter, HTTPException, status, Depends, Query
from app.database.mongo import db
from app.models.pod import PodModel, PodCreate, PodUpdate
from app.middleware.auth import get_current_user
from datetime import datetime
from bson import ObjectId
from typing import List, Optional

router = APIRouter()

@router.post("/")
async def create_pod(
    pod_data: PodCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new pod."""
    try:
        pod_obj = PodModel(
            **pod_data.model_dump(),
            creatorId=current_user["_id"],
            creatorName=current_user.get("displayName", "Anonymous"),
            members=[current_user["_id"]],
            memberCount=1,
            createdAt=datetime.utcnow(),
            updatedAt=datetime.utcnow()
        )
        
        pod_doc = pod_obj.model_dump(by_alias=True, exclude_none=True)
        pod_doc["_id"] = ObjectId()
        
        await db.pods.insert_one(pod_doc)
        
        # Add to user's joined pods
        await db.users.update_one(
            {"_id": current_user["_id"]},
            {"$addToSet": {"joinedPods": pod_doc["_id"]}}
        )
        
        return {
            "success": True,
            "message": "Pod created successfully",
            "data": {"pod": pod_doc}
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create pod: {str(e)}"
        )

@router.get("/")
async def get_pods(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    category: Optional[str] = Query(None)
):
    """Get all public pods."""
    try:
        filter_query = {"isPrivate": False}
        if category:
            filter_query["category"] = category
            
        cursor = db.pods.find(filter_query).skip(skip).limit(limit).sort("createdAt", -1)
        pods = await cursor.to_list(length=limit)
        
        total = await db.pods.count_documents(filter_query)
        
        return {
            "success": True,
            "data": {
                "pods": pods,
                "total": total,
                "skip": skip,
                "limit": limit
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch pods: {str(e)}"
        )

@router.get("/my")
async def get_my_pods(current_user: dict = Depends(get_current_user)):
    """Get pods the current user is a member of."""
    try:
        cursor = db.pods.find({"members": current_user["_id"]})
        pods = await cursor.to_list(length=None)
        
        return {
            "success": True,
            "data": {"pods": pods}
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user pods: {str(e)}"
        )

@router.get("/{pod_id}")
async def get_pod(pod_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific pod by ID."""
    try:
        if not ObjectId.is_valid(pod_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid pod ID"
            )
            
        pod = await db.pods.find_one({"_id": ObjectId(pod_id)})
        if not pod:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pod not found"
            )
            
        # Check if user can access private pod
        if pod.get("isPrivate", False) and current_user["_id"] not in pod.get("members", []):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this pod"
            )
            
        return {
            "success": True,
            "data": {"pod": pod}
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch pod: {str(e)}"
        )

@router.post("/{pod_id}/join")
async def join_pod(pod_id: str, current_user: dict = Depends(get_current_user)):
    """Join a pod."""
    try:
        if not ObjectId.is_valid(pod_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid pod ID"
            )
            
        pod = await db.pods.find_one({"_id": ObjectId(pod_id)})
        if not pod:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pod not found"
            )
            
        # Check if already a member
        if current_user["_id"] in pod.get("members", []):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Already a member of this pod"
            )
            
        # Add user to pod
        await db.pods.update_one(
            {"_id": ObjectId(pod_id)},
            {
                "$addToSet": {"members": current_user["_id"]},
                "$inc": {"memberCount": 1}
            }
        )
        
        # Add pod to user's joined pods
        await db.users.update_one(
            {"_id": current_user["_id"]},
            {"$addToSet": {"joinedPods": ObjectId(pod_id)}}
        )
        
        return {
            "success": True,
            "message": "Successfully joined pod"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to join pod: {str(e)}"
        )

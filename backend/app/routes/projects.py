from fastapi import APIRouter, HTTPException, status, Depends, Query
from app.database.mongo import db
from app.models.project import ProjectModel, ProjectCreate, ProjectUpdate
from app.middleware.auth import get_current_user, require_user_id
from datetime import datetime
from bson import ObjectId
from typing import List, Optional

router = APIRouter()

@router.post("/")
async def create_project(
    project_data: ProjectCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new project."""
    try:
        project_obj = ProjectModel(
            **project_data.model_dump(),
            authorId=current_user["_id"],
            authorName=current_user.get("displayName", "Anonymous"),
            authorEmail=current_user.get("email", ""),
            createdAt=datetime.utcnow(),
            updatedAt=datetime.utcnow()
        )

        project_doc = project_obj.model_dump(by_alias=True, exclude_none=True)
        project_doc["_id"] = ObjectId()

        await db.projects.insert_one(project_doc)

        # Add to user's posted projects
        await db.users.update_one(
            {"_id": current_user["_id"]},
            {"$push": {"postedGigs": project_doc["_id"]}}
        )

        return {
            "success": True,
            "message": "Project created successfully",
            "data": {"project": project_doc}
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create project: {str(e)}"
        )

@router.get("/")
async def get_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None)
):
    """Get all projects with optional filtering."""
    try:
        filter_query = {}
        if type:
            filter_query["type"] = type
        if status:
            filter_query["status"] = status
        if category:
            filter_query["category"] = category

        cursor = db.projects.find(filter_query).skip(skip).limit(limit).sort("createdAt", -1)
        projects = await cursor.to_list(length=limit)

        total = await db.projects.count_documents(filter_query)

        return {
            "success": True,
            "data": {
                "projects": projects,
                "total": total,
                "skip": skip,
                "limit": limit
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch projects: {str(e)}"
        )

@router.get("/{project_id}")
async def get_project(project_id: str):
    """Get a specific project by ID."""
    try:
        if not ObjectId.is_valid(project_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid project ID"
            )

        project = await db.projects.find_one({"_id": ObjectId(project_id)})
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )

        # Increment view count
        await db.projects.update_one(
            {"_id": ObjectId(project_id)},
            {"$inc": {"views": 1}}
        )

        return {
            "success": True,
            "data": {"project": project}
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch project: {str(e)}"
        )

@router.put("/{project_id}")
async def update_project(
    project_id: str,
    project_data: ProjectUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a project."""
    try:
        if not ObjectId.is_valid(project_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid project ID"
            )

        project = await db.projects.find_one({"_id": ObjectId(project_id)})
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )

        # Check if user is the author
        if project["authorId"] != current_user["_id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this project"
            )

        update_data = project_data.model_dump(exclude_unset=True)
        update_data["updatedAt"] = datetime.utcnow()

        await db.projects.update_one(
            {"_id": ObjectId(project_id)},
            {"$set": update_data}
        )

        updated_project = await db.projects.find_one({"_id": ObjectId(project_id)})

        return {
            "success": True,
            "message": "Project updated successfully",
            "data": {"project": updated_project}
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update project: {str(e)}"
        )

@router.delete("/{project_id}")
async def delete_project(
    project_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a project."""
    try:
        if not ObjectId.is_valid(project_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid project ID"
            )

        project = await db.projects.find_one({"_id": ObjectId(project_id)})
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )

        # Check if user is the author
        if project["authorId"] != current_user["_id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this project"
            )

        await db.projects.delete_one({"_id": ObjectId(project_id)})

        # Remove from user's posted projects
        await db.users.update_one(
            {"_id": current_user["_id"]},
            {"$pull": {"postedGigs": ObjectId(project_id)}}
        )

        return {
            "success": True,
            "message": "Project deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete project: {str(e)}"
        )

@router.post("/{project_id}/apply")
async def apply_to_project(
    project_id: str,
    application_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Apply to a project."""
    try:
        if not ObjectId.is_valid(project_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid project ID"
            )

        project = await db.projects.find_one({"_id": ObjectId(project_id)})
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )

        # Check if already applied
        existing_application = await db.projects.find_one({
            "_id": ObjectId(project_id),
            "applications.userId": current_user["_id"]
        })

        if existing_application:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Already applied to this project"
            )

        application = {
            "userId": current_user["_id"],
            "userName": current_user.get("displayName", "Anonymous"),
            "userEmail": current_user.get("email", ""),
            "coverLetter": application_data.get("coverLetter", ""),
            "portfolio": application_data.get("portfolio", ""),
            "expectedSalary": application_data.get("expectedSalary", ""),
            "availability": application_data.get("availability", ""),
            "appliedAt": datetime.utcnow(),
            "status": "pending"
        }

        await db.projects.update_one(
            {"_id": ObjectId(project_id)},
            {
                "$push": {"applications": application},
                "$addToSet": {"applicants": current_user["_id"]}
            }
        )

        # Add to user's applied projects
        await db.users.update_one(
            {"_id": current_user["_id"]},
            {"$addToSet": {"appliedGigs": ObjectId(project_id)}}
        )

        return {
            "success": True,
            "message": "Application submitted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit application: {str(e)}"
        )

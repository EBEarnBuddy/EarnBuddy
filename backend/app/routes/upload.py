from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File
from app.middleware.auth import get_current_user
import aiofiles
import os
from datetime import datetime
import uuid

router = APIRouter()

@router.post("/")
async def upload_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload a file."""
    try:
        # Create uploads directory if it doesn't exist
        upload_dir = "uploads"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Return file URL
        file_url = f"/uploads/{unique_filename}"
        
        return {
            "success": True,
            "message": "File uploaded successfully",
            "data": {
                "filename": file.filename,
                "url": file_url,
                "size": len(content)
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}"
        )

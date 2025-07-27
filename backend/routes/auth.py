#backend/routes/auth.py
from fastapi import APIRouter, HTTPException
from backend.firebase import verify_token
from backend.database.mongo import db
from backend.models.users import UserModel, OnboardingData  # corrected import
from datetime import datetime

router = APIRouter()

@router.post("/verify")
async def verify_id_token(data: dict):
    token = data.get("token")
    if not token:
        raise HTTPException(status_code=400, detail="Token not provided")
    
    try:
        decoded = verify_token(token)
        uid = decoded["uid"]
        email = decoded.get("email", "")
        displayName = decoded.get("name", "Anonymous User")
        photoURL = decoded.get("picture", "")

        # Check if user already exists
        existing_user = await db.users.find_one({"uid": uid})
        
        if not existing_user:
            # Construct a new user using the full UserModel
            user_obj = UserModel(
                uid=uid,
                email=email,
                displayName=displayName,
                photoURL=photoURL,
                createdAt=datetime.utcnow(),
                updatedAt=datetime.utcnow(),
                joinDate=datetime.utcnow(),
                onboardingData=OnboardingData(),
            )
            await db.users.insert_one(user_obj.dict())

        return {"status": "success", "user": {"uid": uid, "email": email, "displayName": displayName}}

    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

from fastapi import APIRouter, HTTPException, status
from pythonBackend.firebase import verify_token
from pythonBackend.database.mongo import db
from pythonBackend.models.users import UserModel, OnboardingData
from datetime import datetime

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)

def convert_user_doc_to_model(doc, model_class):
    if doc is None:
        return None
    doc['id'] = str(doc['_id'])
    return model_class.model_validate(doc)


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

        existing_user = await db.users.find_one({"uid": uid})
        
        if not existing_user:
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
            # Use model_dump to get a dictionary compatible with MongoDB insertion
            user_doc = user_obj.model_dump(by_alias=True, exclude_none=True)
            
            # Use uid as the MongoDB document's _id
            user_doc["_id"] = uid
            user_doc.pop("id", None) # Remove the 'id' field if it exists from pydantic conversion
            
            await db.users.insert_one(user_doc)
            
            # Refetch the user to ensure the document is correctly formatted for the response
            existing_user = await db.users.find_one({"_id": uid})

        # Return the user data
        if existing_user:
            return {"status": "success", "user": {"uid": existing_user.get("uid"), "email": existing_user.get("email"), "displayName": existing_user.get("displayName")}}
        
        raise HTTPException(status_code=500, detail="Failed to retrieve user data after verification.")

    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
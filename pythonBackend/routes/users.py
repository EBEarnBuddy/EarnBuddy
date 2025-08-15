from fastapi import APIRouter, HTTPException, status
from pythonBackend.database.mongo import db
from pythonBackend.models.users import UserModel
from pythonBackend.dependencies import get_current_user_uid
from pydantic import ValidationError

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

def convert_user_doc_to_model(doc, model_class):
    if doc is None:
        return None
    doc['id'] = str(doc['_id'])
    return model_class.model_validate(doc)


@router.get("/{user_id}", response_model=UserModel)
async def get_user_by_id(user_id: str):
    """
    Retrieve user details by their Firebase UID.
    """
    try:
        user_doc = await db.users.find_one({"uid": user_id})
        if user_doc:
            return convert_user_doc_to_model(user_doc, UserModel)
        raise HTTPException(status_code=404, detail="User not found.")
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=f"Validation error: {e.errors()}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user: {e}")
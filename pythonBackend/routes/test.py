#backend/routes/test.py
from fastapi import APIRouter
from ..database.mongo import db

router = APIRouter()

@router.get("/test-mongo")
async def test_mongo():
    try:
        collections = await db.list_collection_names()
        return {"status": "connected", "collections": collections}
    except Exception as e:
        return {"status": "error", "detail": str(e)}
 
# backend/main.py
'''from fastapi import FastAPI
from backend.routes import auth, test, pods
from backend.firebase import initialize_firebase
from backend.database.mongo import db  # import the db
import asyncio

app = FastAPI()
initialize_firebase()

@app.get("/")
def read_root():
    return {"message": "Backend up and running!"}

app.include_router(auth.router)
app.include_router(test.router)
app.include_router(pods.router) 

#  MongoDB startup logic to ensure index
@app.on_event("startup")
async def startup_db_tasks():
    await db.users.create_index("uid", unique=True)'''

# backend/main.py
from fastapi import FastAPI
from contextlib import asynccontextmanager
from backend.routes import auth, test, pods, posts, reply # Existing imports
from backend.routes import rooms # <--- NEW: Import the rooms router
from backend.routes import messages # <--- NEW: Import the messages router
from backend.firebase import initialize_firebase
from backend.database.mongo import db
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("INFO: Application startup sequence initiated.")
    initialize_firebase()

    try:
        print("INFO: Attempting to ensure index on 'users' collection (uid).")
        await db.users.create_index("uid", unique=True)
        print("INFO: MongoDB 'users' collection index on 'uid' ensured successfully.")
    except Exception as e:
        print(f"ERROR: Failed to create index on 'users' collection (uid): {e}")

    try:
        print("INFO: Attempting to ensure index on 'pods' collection (slug).")
        await db.pods.create_index("slug", unique=True)
        print("INFO: MongoDB 'pods' collection index on 'slug' ensured successfully.")
    except Exception as e:
        print(f"ERROR: Failed to create index on 'pods' collection (slug): {e}")

    try:
        print("INFO: Attempting to ensure index on 'posts' collection (podId and createdAt).")
        await db.posts.create_index([("podId", 1), ("createdAt", -1)])
        print("INFO: MongoDB 'posts' collection index ensured successfully.")
    except Exception as e:
        print(f"ERROR: Failed to create index on 'posts' collection: {e}")

    try:
        print("INFO: Attempting to ensure index on 'replies' collection (postId and createdAt).")
        await db.replies.create_index([("postId", 1), ("createdAt", 1)])
        print("INFO: MongoDB 'replies' collection index ensured successfully.")
    except Exception as e:
        print(f"ERROR: Failed to create index on 'replies' collection: {e}")
    
    # --- NEW: Ensure indexes for Rooms and Messages ---
    try:
        print("INFO: Attempting to ensure index on 'rooms' collection (name and members).")
        # Index on name for lookup, and members for finding rooms a user is in
        await db.rooms.create_index([("name", 1)])
        await db.rooms.create_index([("members", 1)])
        print("INFO: MongoDB 'rooms' collection indexes ensured successfully.")
    except Exception as e:
        print(f"ERROR: Failed to create index on 'rooms' collection: {e}")

    try:
        print("INFO: Attempting to ensure index on 'messages' collection (roomId and createdAt).")
        # Index for querying messages by room, sorted by date
        await db.messages.create_index([("roomId", 1), ("createdAt", 1)])
        print("INFO: MongoDB 'messages' collection index ensured successfully.")
    except Exception as e:
        print(f"ERROR: Failed to create index on 'messages' collection: {e}")
    # --- END NEW ---

    print("INFO: Startup tasks completed. Application ready to serve.")
    yield

    print("INFO: Application shutdown sequence initiated.")
    print("INFO: Application shutdown complete.")

app = FastAPI(lifespan=lifespan)

app.include_router(auth.router)
app.include_router(test.router)
app.include_router(pods.router)
app.include_router(posts.router)
app.include_router(reply.router)
app.include_router(rooms.router) # <--- NEW: Include the rooms router
app.include_router(messages.router) # <--- NEW: Include the messages router

@app.get("/")
def read_root():
    return {"message": "Backend up and running!"}

@app.get("/test-mongo")
async def test_mongo_connection():
    try:
        collections = await db.list_collection_names()
        return {"status": "connected", "collections": collections}
    except Exception as e:
        return {"status": "error", "message": f"Could not connect to MongoDB: {e}"}
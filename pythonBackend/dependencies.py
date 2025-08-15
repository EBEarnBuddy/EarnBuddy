# backend/dependencies.py

'''from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth
from firebase_admin.exceptions import FirebaseError

# HTTPBearer is used to expect a "Bearer Token" in the Authorization header
oauth2_scheme = HTTPBearer()

async def get_current_user_uid(credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme)) -> str:
    """
    Dependency to verify Firebase ID Token and return the user's UID.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        # Verify the ID token using Firebase Admin SDK
        decoded_token = auth.verify_id_token(credentials.credentials)
        uid = decoded_token['uid']
        return uid
    except FirebaseError as e:
        # This catches errors specifically from Firebase Admin SDK (e.g., expired token, malformed token)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        # Catch any other unexpected errors during token processing
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication server error: {e}",
        )'''

# backend/dependencies.py
from fastapi import HTTPException, Header, status, Depends, WebSocket
from firebase_admin import auth
from typing import Optional

# Function to verify Firebase ID token (reusable for both HTTP and WS)
async def verify_firebase_token(id_token: str):
    try:
        # print(f"DEBUG: Verifying token: {id_token[:20]}...") # For debugging
        decoded_token = auth.verify_id_token(id_token)
        # print(f"DEBUG: Token decoded for UID: {decoded_token.get('uid')}") # For debugging
        return decoded_token['uid']
    except Exception as e:
        # print(f"ERROR: Token verification failed: {e}") # For debugging
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Dependency for HTTP routes
async def get_current_user_uid(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authorization header missing")
    
    # Expecting "Bearer <token>"
    scheme, token = authorization.split(" ")
    if scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication scheme")
    
    return await verify_firebase_token(token)

# Dependency for WebSocket routes
async def ws_get_current_user_uid(websocket: WebSocket):
    # Try to get token from query parameter (common for client-side WS libraries)
    token = websocket.query_params.get("token")
    
    if not token:
        # As a fallback, try to get from Authorization header if client sends it during handshake
        auth_header = websocket.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    if not token:
        # print("ERROR: WebSocket authentication token missing.") # For debugging
        # Close connection immediately if no token found
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Authentication token missing")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication token missing for WebSocket")
    
    try:
        uid = await verify_firebase_token(token)
        # print(f"DEBUG: WebSocket authenticated for UID: {uid}") # For debugging
        return uid
    except HTTPException as e:
        # print(f"ERROR: WebSocket authentication failed: {e.detail}") # For debugging
        # Close connection if token is invalid
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason=e.detail)
        raise # Re-raise to prevent further execution
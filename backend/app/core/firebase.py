import firebase_admin
from firebase_admin import credentials, auth
import os
from typing import Optional, Dict, Any

# Initialize Firebase Admin SDK
def initialize_firebase():
    """Initialize Firebase Admin SDK."""
    try:
        # Check if Firebase is already initialized
        if not firebase_admin._apps:
            # Use service account key if available
            service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
            if service_account_path and os.path.exists(service_account_path):
                cred = credentials.Certificate(service_account_path)
                firebase_admin.initialize_app(cred)
            else:
                # Use default credentials (for development)
                firebase_admin.initialize_app()
            print("✅ Firebase Admin SDK initialized successfully.")
        else:
            print("✅ Firebase Admin SDK already initialized.")
    except Exception as e:
        print(f"❌ Failed to initialize Firebase Admin SDK: {e}")

def verify_token(id_token: str) -> Dict[str, Any]:
    """Verify Firebase ID token."""
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        raise ValueError(f"Invalid token: {e}")

def get_user_by_uid(uid: str) -> Optional[Dict[str, Any]]:
    """Get user by Firebase UID."""
    try:
        user = auth.get_user(uid)
        return {
            "uid": user.uid,
            "email": user.email,
            "display_name": user.display_name,
            "photo_url": user.photo_url,
            "email_verified": user.email_verified
        }
    except Exception as e:
        print(f"Error getting user by UID: {e}")
        return None

def create_custom_token(uid: str, additional_claims: Optional[Dict[str, Any]] = None) -> str:
    """Create custom token for user."""
    try:
        return auth.create_custom_token(uid, additional_claims or {})
    except Exception as e:
        raise ValueError(f"Failed to create custom token: {e}")

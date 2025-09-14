
# backend/firebase.py

from firebase_admin import auth, credentials, initialize_app
import firebase_admin

# Initialize only once
def initialize_firebase():
    if not firebase_admin._apps:
        cred = credentials.Certificate("pythonBackend/serviceAccountKey.json")
        initialize_app(cred)


def verify_token(token: str):
    """
    Verifies the Firebase token and returns decoded user info.
    """
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise ValueError(f"Invalid token: {e}")


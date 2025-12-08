from typing import Dict, Optional

import requests
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from google.auth import jwt

FIREBASE_PROJECT_ID = "freely-c74ae"

bearer_scheme = HTTPBearer(auto_error=False)


def verify_firebase_token(token: str) -> Dict:
  """
  Verify a Firebase ID token (JWT) and return the decoded payload.

  This implementation verifies the token signature using Google's public keys
  and checks the issuer and audience claims.
  """
  try:
    # Fetch Google's public keys for Firebase
    response = requests.get("https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com", timeout=5)
    response.raise_for_status()
    certs = response.json()

    # Decode and verify JWT
    decoded = jwt.decode(
      token,
      certs,
      audience=FIREBASE_PROJECT_ID,
    )

    # Basic issuer check
    issuer = decoded.get("iss")
    expected_issuer = f"https://securetoken.google.com/{FIREBASE_PROJECT_ID}"
    if issuer != expected_issuer:
      print(f"❌ Token issuer mismatch. Expected: {expected_issuer}, Got: {issuer}")
      raise ValueError(f"Invalid token issuer. Expected: {expected_issuer}, Got: {issuer}")

    return decoded
  except HTTPException:
    # Re-raise HTTP exceptions as-is
    raise
  except Exception as exc:  # noqa: BLE001
    import traceback
    error_type = type(exc).__name__
    error_msg = str(exc)
    
    # Log the actual error for debugging
    print(f"❌ Token verification failed: {error_type}: {error_msg}")
    print(f"   Token preview: {token[:50]}..." if token and len(token) > 50 else f"   Token: {token}")
    traceback.print_exc()
    
    # Provide more specific error messages
    if "expired" in error_msg.lower() or "exp" in error_msg.lower():
      detail_msg = "Authentication token has expired. Please sign in again."
    elif "audience" in error_msg.lower() or "aud" in error_msg.lower():
      detail_msg = f"Token audience mismatch. Expected project: {FIREBASE_PROJECT_ID}"
    elif "signature" in error_msg.lower() or "invalid" in error_msg.lower():
      detail_msg = "Invalid token signature. Please sign in again."
    else:
      detail_msg = f"Token verification failed: {error_msg}"
    
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail=detail_msg,
    ) from exc


def get_current_user(
  credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> Dict:
  """
  FastAPI dependency that extracts and verifies the Firebase ID token
  from the Authorization header.
  """
  if credentials is None or credentials.scheme.lower() != "bearer":
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Missing or invalid Authorization header",
    )

  token = credentials.credentials
  return verify_firebase_token(token)



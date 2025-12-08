"""
Database models and schemas for MongoDB collections.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


class User(BaseModel):
    """User model."""
    uid: str  # Firebase UID
    email: EmailStr
    display_name: Optional[str] = None
    email_verified: bool = False
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()


class RiskAnalysis(BaseModel):
    """Risk Analysis model."""
    user_id: str  # Firebase UID
    analysis_type: str  # "client_chat_import", "job_proposal", "text"
    client_name: Optional[str] = None  # Client/Project name
    status: str = "pending"  # "pending", "processing", "completed", "failed"
    input_data: dict = {}
    results: Optional[dict] = None
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()


class Proposal(BaseModel):
    """Proposal model."""
    user_id: str  # Firebase UID
    proposal_type: str  # "from_chat", "from_text"
    client_name: Optional[str] = None  # Client/Project name
    status: str = "pending"  # "pending", "processing", "completed", "failed"
    input_data: dict = {}  # Stores file metadata, chat content, etc.
    results: Optional[dict] = None  # Stores AI-generated proposal
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()


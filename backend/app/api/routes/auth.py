from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.api import deps
from app.models.user import User

router = APIRouter()

class UserCreate(BaseModel):
    email: str = Field(..., min_length=5, max_length=100, pattern=r"^[^@]+@[^@]+\.[^@]+$", description="Valid email address")
    password: str = Field(..., min_length=8, max_length=128, description="Password must be at least 8 characters")

class UserResponse(BaseModel):
    id: int
    email: str
    is_active: bool

    class Config:
        from_attributes = True

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(deps.get_db)):
    # Very basic placeholder: in production use passlib for hashing
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # MOCK HASHING
    new_user = User(
        email=user_in.email,
        hashed_password=f"fakehash_{user_in.password}"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login")
def login(user_in: UserCreate, db: Session = Depends(deps.get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or user.hashed_password != f"fakehash_{user_in.password}":
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    # MOCK TOKEN
    return {"access_token": f"token_for_{user.email}", "token_type": "bearer"}

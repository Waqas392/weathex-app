from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import UserCreate, UserLogin, TokenResponse, UserResponse
from auth_utils import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter()

@router.post("/register", response_model=TokenResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    db_user = User(
        email=user.email,
        full_name=user.full_name,
        hashed_password=hash_password(user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    token = create_access_token({"sub": str(db_user.id)})
    return TokenResponse(access_token=token, user=db_user)

@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, user=user)

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
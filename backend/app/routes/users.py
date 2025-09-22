from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..deps import get_db, get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=schemas.UserOut)
def get_me(user: models.User = Depends(get_current_user)):
    """Return the currently logged-in user's profile"""
    return user


@router.get("/", response_model=list[schemas.UserOut])
def list_users(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    """
    Role-based user listing:
    - Child → only themselves
    - Parent → themselves + their children
    """
    if user.role == "child":
        return [user]

    if user.role == "parent":
        children = db.query(models.User).filter(models.User.parent_id == user.id).all()
        return [user] + children

    raise HTTPException(status_code=403, detail="Unauthorized")

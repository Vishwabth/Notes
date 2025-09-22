from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..deps import get_db, get_current_user

router = APIRouter(prefix="/folders", tags=["Folders"])


@router.post("/", response_model=schemas.FolderOut)
def create_folder(
    folder: schemas.FolderCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    if user.role != "child":
        raise HTTPException(status_code=403, detail="Only children can create folders")

    db_folder = models.Folder(name=folder.name, owner_id=user.id)
    db.add(db_folder)
    db.commit()
    db.refresh(db_folder)
    return db_folder


@router.get("/", response_model=list[schemas.FolderOut])
def list_folders(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    if user.role == "child":
        folders = db.query(models.Folder).filter(models.Folder.owner_id == user.id).all()
    else:  # parent
        children = db.query(models.User).filter(models.User.parent_id == user.id).all()
        child_ids = [c.id for c in children]
        folders = db.query(models.Folder).filter(models.Folder.owner_id.in_(child_ids)).all()
    return folders


@router.put("/{folder_id}", response_model=schemas.FolderOut)
def update_folder(
    folder_id: int,
    updated: schemas.FolderCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    if user.role != "child":
        raise HTTPException(status_code=403, detail="Only children can update folders")

    db_folder = db.query(models.Folder).filter(models.Folder.id == folder_id, models.Folder.owner_id == user.id).first()
    if not db_folder:
        raise HTTPException(status_code=404, detail="Folder not found or not owned")

    db_folder.name = updated.name
    db.commit()
    db.refresh(db_folder)
    return db_folder


@router.delete("/{folder_id}")
def delete_folder(folder_id: int, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    if user.role != "child":
        raise HTTPException(status_code=403, detail="Only children can delete folders")

    db_folder = db.query(models.Folder).filter(models.Folder.id == folder_id, models.Folder.owner_id == user.id).first()
    if not db_folder:
        raise HTTPException(status_code=404, detail="Folder not found")

    db.delete(db_folder)
    db.commit()
    return {"detail": "Folder deleted"}

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from .. import models, schemas
from ..deps import get_db, get_current_user

router = APIRouter(prefix="/notes", tags=["Notes"])


# -------------------- Helpers --------------------
def tags_to_list(tags_str: str | None) -> list[str]:
    if not tags_str:
        return []
    return [t.strip() for t in tags_str.split(",") if t.strip()]


def list_to_tags(tags_list: list[str] | None) -> str | None:
    if not tags_list:
        return None
    return ",".join(tags_list)


# -------------------- Routes --------------------
@router.post("/", response_model=schemas.NoteOut)
def create_note(
    note: schemas.NoteCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    if user.role != "child":
        raise HTTPException(status_code=403, detail="Only children can create notes")

    db_note = models.Note(
        title=note.title,
        content=note.content if not note.is_checklist else None,
        checklist_items=[item.dict() for item in (note.checklist_items or [])]
        if note.is_checklist
        else None,
        folder_id=note.folder_id,
        owner_id=user.id,
        tags=list_to_tags(note.tags),
        is_checklist=note.is_checklist,
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)

    return schemas.NoteOut(
        id=db_note.id,
        title=db_note.title,
        content=db_note.content,
        checklist_items=db_note.checklist_items or [],
        tags=tags_to_list(db_note.tags),
        is_checklist=db_note.is_checklist,
        created_at=db_note.created_at,
        updated_at=db_note.updated_at,
    )


@router.get("/", response_model=list[schemas.NoteOut])
def list_notes(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    if user.role == "child":
        notes = db.query(models.Note).filter(models.Note.owner_id == user.id).all()
    else:  # parent sees all children’s notes
        children = db.query(models.User).filter(models.User.parent_id == user.id).all()
        child_ids = [c.id for c in children]
        notes = db.query(models.Note).filter(models.Note.owner_id.in_(child_ids)).all()

    return [
        schemas.NoteOut(
            id=n.id,
            title=n.title,
            content=n.content,
            checklist_items=n.checklist_items or [],
            tags=tags_to_list(n.tags),
            is_checklist=n.is_checklist,
            created_at=n.created_at,
            updated_at=n.updated_at,
        )
        for n in notes
    ]


@router.put("/{note_id}", response_model=schemas.NoteOut)
def update_note(
    note_id: int,
    updated: schemas.NoteCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    if user.role != "child":
        raise HTTPException(status_code=403, detail="Only children can update notes")

    db_note = (
        db.query(models.Note)
        .filter(models.Note.id == note_id, models.Note.owner_id == user.id)
        .first()
    )
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found or not owned")

    db_note.title = updated.title
    db_note.content = updated.content if not updated.is_checklist else None
    db_note.checklist_items = (
        [item.dict() for item in (updated.checklist_items or [])]
        if updated.is_checklist
        else None
    )
    db_note.tags = list_to_tags(updated.tags)
    db_note.is_checklist = updated.is_checklist

    db.commit()
    db.refresh(db_note)

    return schemas.NoteOut(
        id=db_note.id,
        title=db_note.title,
        content=db_note.content,
        checklist_items=db_note.checklist_items or [],
        tags=tags_to_list(db_note.tags),
        is_checklist=db_note.is_checklist,
        created_at=db_note.created_at,
        updated_at=db_note.updated_at,
    )


@router.patch("/{note_id}/checklist", response_model=schemas.NoteOut)
def update_checklist(
    note_id: int,
    items: list[schemas.ChecklistItem],
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    if user.role != "child":
        raise HTTPException(status_code=403, detail="Only children can update checklist items")

    db_note = (
        db.query(models.Note)
        .filter(models.Note.id == note_id, models.Note.owner_id == user.id)
        .first()
    )
    if not db_note or not db_note.is_checklist:
        raise HTTPException(status_code=404, detail="Checklist note not found")

    db_note.checklist_items = [i.dict() for i in items]
    db.commit()
    db.refresh(db_note)

    return schemas.NoteOut(
        id=db_note.id,
        title=db_note.title,
        content=db_note.content,
        checklist_items=db_note.checklist_items or [],
        tags=tags_to_list(db_note.tags),
        is_checklist=db_note.is_checklist,
        created_at=db_note.created_at,
        updated_at=db_note.updated_at,
    )


@router.delete("/{note_id}")
def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    if user.role != "child":
        raise HTTPException(status_code=403, detail="Only children can delete notes")

    db_note = (
        db.query(models.Note)
        .filter(models.Note.id == note_id, models.Note.owner_id == user.id)
        .first()
    )
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")

    db.delete(db_note)
    db.commit()
    return {"detail": "Note deleted"}

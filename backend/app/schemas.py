from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# -------------------- User --------------------
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str = "child"  # "child" or "parent"
    parent_id: Optional[int] = None


class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str
    parent_id: Optional[int]

    class Config:
        from_attributes = True


# -------------------- Auth --------------------
class Token(BaseModel):
    access_token: str
    token_type: str


# -------------------- Notes --------------------
class ChecklistItem(BaseModel):
    task: str
    done: bool = False

class NoteCreate(BaseModel):
    title: str
    content: Optional[str] = None
    is_checklist: bool = False
    checklist_items: Optional[List[ChecklistItem]] = []
    tags: Optional[List[str]] = []
    folder_id: Optional[int] = None

class NoteOut(BaseModel):
    id: int
    title: str
    content: Optional[str]
    is_checklist: bool
    checklist_items: Optional[List[ChecklistItem]] = []
    tags: List[str] = []
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True


# -------------------- Folders --------------------
class FolderCreate(BaseModel):
    name: str


class FolderOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

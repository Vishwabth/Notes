from sqlalchemy import Column, String, Integer, ForeignKey, Text, DateTime, Enum, Boolean, JSON, func
from sqlalchemy.orm import relationship
import enum
from datetime import datetime
from .database import Base


class RoleEnum(str, enum.Enum):
    child = "child"
    parent = "parent"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.child, nullable=False)
    parent_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    children = relationship("User", remote_side=[id])
    notes = relationship("Note", back_populates="owner", cascade="all, delete")
    folders = relationship("Folder", back_populates="owner", cascade="all, delete")


class Folder(Base):
    __tablename__ = "folders"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))

    owner = relationship("User", back_populates="folders")
    notes = relationship("Note", back_populates="folder", cascade="all, delete")


class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=True)
    checklist_items = Column(JSON, nullable=True)   # ✅ NEW
    tags = Column(String, nullable=True)
    is_checklist = Column(Boolean, default=False)
    folder_id = Column(Integer, ForeignKey("folders.id"), nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    owner = relationship("User", back_populates="notes")
    folder = relationship("Folder", back_populates="notes")
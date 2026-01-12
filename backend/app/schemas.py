from pydantic import BaseModel, EmailStr
from typing import Optional, List, Literal
from datetime import datetime
from enum import Enum


# Priority Enum for validation
class PriorityLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    photo: Optional[str] = None

    class Config:
        from_attributes = True

class LoginResponse(BaseModel):
    data: UserResponse


# Todo Schemas
class TodoCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: PriorityLevel = PriorityLevel.MEDIUM

class TodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[PriorityLevel] = None

class TodoResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    completed: bool
    priority: str
    created_at: Optional[datetime] = None
    user_id: int

    class Config:
        from_attributes = True

class TodoListResponse(BaseModel):
    todos: List[TodoResponse]
    total: int
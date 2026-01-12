from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import database, models, schemas

router = APIRouter(prefix="/todos", tags=["todos"])


# Get all todos for a user
@router.get("", response_model=schemas.TodoListResponse)
def get_todos(
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db)
):
    """Get all todos for a specific user"""
    todos = db.query(models.Todo).filter(
        models.Todo.user_id == user_id
    ).order_by(models.Todo.created_at.desc()).offset(skip).limit(limit).all()
    
    total = db.query(models.Todo).filter(models.Todo.user_id == user_id).count()
    
    return schemas.TodoListResponse(todos=todos, total=total)

# Create a new todo
@router.post("", response_model=schemas.TodoResponse, status_code=status.HTTP_201_CREATED)
def create_todo(
    todo: schemas.TodoCreate,
    user_id: int,
    db: Session = Depends(database.get_db)
):
    """Create a new todo for a user"""
    # Verify user exists
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    db_todo = models.Todo(
        title=todo.title,
        description=todo.description,
        priority=todo.priority.value,
        user_id=user_id
    )
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo

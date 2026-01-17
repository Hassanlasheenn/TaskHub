from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List
from .. import database, models, schemas

router = APIRouter(prefix="/todos", tags=["todos"])


@router.get("", response_model=schemas.TodoListResponse)
def get_todos(
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db)
):
    todos = db.query(models.Todo).filter(
        or_(
            models.Todo.user_id == user_id,
            models.Todo.assigned_to_user_id == user_id
        )
    ).order_by(models.Todo.order_index.asc()).offset(skip).limit(limit).all()
    
    total = db.query(models.Todo).filter(
        or_(
            models.Todo.user_id == user_id,
            models.Todo.assigned_to_user_id == user_id
        )
    ).count()
    
    todo_responses = []
    for todo in todos:
        assigned_to_username = None
        if todo.assigned_to_user_id:
            assigned_user = db.query(models.User).filter(
                models.User.id == todo.assigned_to_user_id
            ).first()
            if assigned_user:
                assigned_to_username = assigned_user.username
        
        todo_dict = {
            "id": todo.id,
            "title": todo.title,
            "description": todo.description,
            "completed": todo.completed,
            "priority": todo.priority,
            "category": todo.category,
            "order_index": todo.order_index,
            "created_at": todo.created_at,
            "updated_at": todo.updated_at,
            "user_id": todo.user_id,
            "assigned_to_user_id": todo.assigned_to_user_id,
            "assigned_to_username": assigned_to_username
        }
        todo_responses.append(schemas.TodoResponse(**todo_dict))
    
    return schemas.TodoListResponse(todos=todo_responses, total=total)


@router.post("", response_model=schemas.TodoResponse, status_code=status.HTTP_201_CREATED)
def create_todo(
    todo: schemas.TodoCreate,
    user_id: int,
    db: Session = Depends(database.get_db)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    max_index = db.query(func.max(models.Todo.order_index)).filter(
        models.Todo.user_id == user_id
    ).scalar()
    next_index = (max_index or 0) + 1
    
    assigned_to_user = None
    if todo.assigned_to_user_id:
        assigned_to_user = db.query(models.User).filter(
            models.User.id == todo.assigned_to_user_id,
            models.User.role == models.UserRole.USER.value
        ).first()
        if not assigned_to_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assigned user not found or is not a regular user"
            )
    
    db_todo = models.Todo(
        title=todo.title,
        description=todo.description,
        priority=todo.priority.value,
        category=todo.category,
        order_index=next_index,
        user_id=user_id,
        assigned_to_user_id=todo.assigned_to_user_id
    )
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    
    assigned_to_username = None
    if db_todo.assigned_to_user_id:
        assigned_user = db.query(models.User).filter(
            models.User.id == db_todo.assigned_to_user_id
        ).first()
        if assigned_user:
            assigned_to_username = assigned_user.username
    
    todo_dict = {
        "id": db_todo.id,
        "title": db_todo.title,
        "description": db_todo.description,
        "completed": db_todo.completed,
        "priority": db_todo.priority,
        "category": db_todo.category,
        "order_index": db_todo.order_index,
        "created_at": db_todo.created_at,
        "updated_at": db_todo.updated_at,
        "user_id": db_todo.user_id,
        "assigned_to_user_id": db_todo.assigned_to_user_id,
        "assigned_to_username": assigned_to_username
    }
    return schemas.TodoResponse(**todo_dict)

def _validate_assigned_user(assigned_user_id: int, db: Session) -> None:
    assigned_user = db.query(models.User).filter(
        models.User.id == assigned_user_id,
        models.User.role == models.UserRole.USER.value
    ).first()
    if not assigned_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assigned user not found or is not a regular user"
        )


def _get_assigned_username(assigned_user_id: int | None, db: Session) -> str | None:
    if not assigned_user_id:
        return None
    assigned_user = db.query(models.User).filter(
        models.User.id == assigned_user_id
    ).first()
    return assigned_user.username if assigned_user else None


def _build_todo_response(todo_db: models.Todo, db: Session) -> schemas.TodoResponse:
    assigned_to_username = _get_assigned_username(todo_db.assigned_to_user_id, db)
    todo_dict = {
        "id": todo_db.id,
        "title": todo_db.title,
        "description": todo_db.description,
        "completed": todo_db.completed,
        "priority": todo_db.priority,
        "category": todo_db.category,
        "order_index": todo_db.order_index,
        "created_at": todo_db.created_at,
        "updated_at": todo_db.updated_at,
        "user_id": todo_db.user_id,
        "assigned_to_user_id": todo_db.assigned_to_user_id,
        "assigned_to_username": assigned_to_username
    }
    return schemas.TodoResponse(**todo_dict)


@router.put("/{todo_id}", response_model=schemas.TodoResponse)
def update_todo(todo_id: int, todo: schemas.TodoUpdate, user_id: int, db: Session = Depends(database.get_db)):
    """Update a todo by ID"""
    todo_db = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    if not todo_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")
    if todo_db.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized to update this todo")
    
    # Update fields if provided
    if todo.title:
        todo_db.title = todo.title
    if todo.description is not None:
        todo_db.description = todo.description
    if todo.priority:
        todo_db.priority = todo.priority.value
    if todo.completed is not None:
        todo_db.completed = todo.completed
    if todo.category is not None:
        todo_db.category = todo.category
    
    # Handle assigned user update
    if todo.assigned_to_user_id is not None:
        if todo.assigned_to_user_id:
            _validate_assigned_user(todo.assigned_to_user_id, db)
        todo_db.assigned_to_user_id = todo.assigned_to_user_id
    
    db.commit()
    db.refresh(todo_db)
    return _build_todo_response(todo_db, db)

@router.delete("/{todo_id}")
def delete_todo(
    todo_id: int,
    user_id: int,
    db: Session = Depends(database.get_db)
):
    """Delete a todo by ID and reorder remaining todos"""
    todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    if not todo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")
    
    if todo.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized to delete this todo")

    deleted_index = todo.order_index
    db.delete(todo)
    
    db.query(models.Todo).filter(
        models.Todo.user_id == user_id,
        models.Todo.order_index > deleted_index
    ).update({models.Todo.order_index: models.Todo.order_index - 1})
    
    db.commit()

    return {"message": "Todo deleted successfully"}

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import database, models, schemas


router = APIRouter(tags=["users"])

# get user by ID
@router.get("/{user_id}", response_model=schemas.UserResponse)
def get_user_data(user_id: int, db: Session = Depends(database.get_db)):
    # find user with the id
    user_db = db.query(models.User).filter(models.User.id == user_id).first()
    if user_db is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user_db

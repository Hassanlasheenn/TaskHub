"""
Script to set a user as admin
Usage: python set_admin_user.py <email>
"""
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import text
from app.database import engine, SessionLocal

def set_admin_user(email: str):
    """Set a user as admin by email"""
    db = SessionLocal()
    
    try:
        # Check if user exists
        result = db.execute(text("SELECT id, email, role FROM users WHERE email = :email"), {"email": email})
        user = result.fetchone()
        
        if not user:
            print(f"[ERROR] User with email '{email}' not found!")
            print("\nAvailable users:")
            all_users = db.execute(text("SELECT id, email, username, role FROM users"))
            for u in all_users:
                print(f"  - {u.email} ({u.username}) - Role: {u.role}")
            return False
        
        user_id, user_email, current_role = user
        
        if current_role == "admin":
            print(f"[INFO] User '{email}' is already an admin!")
            return True
        
        # Update user role to admin
        db.execute(text("UPDATE users SET role = 'admin' WHERE email = :email"), {"email": email})
        db.commit()
        
        print("=" * 60)
        print(f"[SUCCESS] User '{email}' has been set as admin!")
        print("=" * 60)
        print(f"User ID: {user_id}")
        print(f"Email: {user_email}")
        print(f"Previous Role: {current_role}")
        print(f"New Role: admin")
        print("=" * 60)
        return True
        
    except Exception as e:
        print(f"[ERROR] Failed to set admin: {e}")
        db.rollback()
        return False
    finally:
        db.close()

def list_users():
    """List all users and their roles"""
    db = SessionLocal()
    
    try:
        users = db.execute(text("SELECT id, email, username, role FROM users ORDER BY id"))
        print("=" * 60)
        print("All Users:")
        print("=" * 60)
        print(f"{'ID':<5} {'Email':<30} {'Username':<20} {'Role':<10}")
        print("-" * 60)
        for user in users:
            print(f"{user.id:<5} {user.email:<30} {user.username or 'N/A':<20} {user.role:<10}")
        print("=" * 60)
    except Exception as e:
        print(f"[ERROR] Failed to list users: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("=" * 60)
        print("Set Admin User Script")
        print("=" * 60)
        print("\nUsage:")
        print("  python set_admin_user.py <email>")
        print("\nExample:")
        print("  python set_admin_user.py user@example.com")
        print("\nTo list all users:")
        print("  python set_admin_user.py --list")
        print("=" * 60)
        sys.exit(1)
    
    if sys.argv[1] == "--list":
        list_users()
    else:
        email = sys.argv[1]
        set_admin_user(email)

"""
Migration script to add role column to users table
"""
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import text
from app.database import engine, SessionLocal

def run_migration():
    """Add role column to users table"""
    db = SessionLocal()
    
    try:
        db_url = str(engine.url).lower()
        print(f"Database detected: {db_url[:50]}...")
        
        if 'sqlite' in db_url:
            result = db.execute(text("PRAGMA table_info(users)"))
            columns = [row[1] for row in result]
            
            if 'role' not in columns:
                print("[...] Adding role column...")
                db.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user' NOT NULL"))
                # Update existing users to have 'user' role
                db.execute(text("UPDATE users SET role = 'user' WHERE role IS NULL"))
            else:
                print("[OK] role column already exists. Skipping.")
                
        elif 'mysql' in db_url or 'mariadb' in db_url:
            result = db.execute(text("""
                SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role'
            """))
            if result.scalar() == 0:
                print("[...] Adding role column...")
                db.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user' NOT NULL"))
                # Create index
                db.execute(text("CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)"))
            else:
                print("[OK] role column already exists. Skipping.")
            
        elif 'postgresql' in db_url or 'postgres' in db_url:
            result = db.execute(text("""
                SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'role'
            """))
            if result.scalar() == 0:
                print("[...] Adding role column...")
                db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' NOT NULL"))
                # Create index
                db.execute(text("CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)"))
            else:
                print("[OK] role column already exists. Skipping.")
            
        elif 'mssql' in db_url or 'sqlserver' in db_url:
            result = db.execute(text("""
                SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'role'
            """))
            if result.scalar() == 0:
                print("[...] Adding role column...")
                db.execute(text("ALTER TABLE users ADD role NVARCHAR(20) NOT NULL DEFAULT 'user'"))
                # Create index
                try:
                    db.execute(text("CREATE INDEX idx_users_role ON users(role)"))
                    print("[...] Created index on role column...")
                except:
                    pass  # Index might already exist
            else:
                print("[OK] role column already exists. Skipping.")
        else:
            print(f"[WARNING] Unknown database type: {db_url}")
            print("[WARNING] Please manually add the role column:")
            print("  ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user' NOT NULL")
            return
            
        db.commit()
        print("[OK] Migration completed successfully!")
        
    except Exception as e:
        print(f"[ERROR] Error during migration: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 50)
    print("Running migration: Add role column to users")
    print("=" * 50)
    run_migration()

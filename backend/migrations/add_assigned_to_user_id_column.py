import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
from sqlalchemy import text
from app.database import engine, SessionLocal

def run_migration():
    db = SessionLocal()
    try:
        db_url = str(engine.url).lower()
        print(f"Database detected: {db_url[:50]}...")

        # Check if column already exists
        if 'mssql' in db_url or 'sqlserver' in db_url:
            result = db.execute(text("""
                SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = 'todos' AND COLUMN_NAME = 'assigned_to_user_id'
            """))
            if result.scalar() > 0:
                print("[OK] assigned_to_user_id column already exists. Skipping.")
                return

            print("[...] Adding assigned_to_user_id column...")
            db.execute(text("ALTER TABLE todos ADD assigned_to_user_id INT NULL"))
            print("[...] Creating foreign key constraint...")
            db.execute(text("""
                ALTER TABLE todos 
                ADD CONSTRAINT FK_todos_assigned_to_user 
                FOREIGN KEY (assigned_to_user_id) REFERENCES users(id)
            """))

        elif 'sqlite' in db_url:
            result = db.execute(text("PRAGMA table_info(todos)"))
            columns = [row[1] for row in result]
            if 'assigned_to_user_id' in columns:
                print("[OK] assigned_to_user_id column already exists. Skipping.")
                return

            print("[...] Adding assigned_to_user_id column...")
            db.execute(text("ALTER TABLE todos ADD COLUMN assigned_to_user_id INTEGER"))
            print("[...] Creating foreign key constraint...")
            db.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_todos_assigned_to_user_id 
                ON todos(assigned_to_user_id)
            """))

        elif 'mysql' in db_url or 'mariadb' in db_url:
            result = db.execute(text("""
                SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'todos' AND COLUMN_NAME = 'assigned_to_user_id'
            """))
            if result.scalar() > 0:
                print("[OK] assigned_to_user_id column already exists. Skipping.")
                return

            print("[...] Adding assigned_to_user_id column...")
            db.execute(text("ALTER TABLE todos ADD COLUMN assigned_to_user_id INT NULL"))
            print("[...] Creating foreign key constraint...")
            db.execute(text("""
                ALTER TABLE todos 
                ADD CONSTRAINT FK_todos_assigned_to_user 
                FOREIGN KEY (assigned_to_user_id) REFERENCES users(id)
            """))

        elif 'postgresql' in db_url or 'postgres' in db_url:
            result = db.execute(text("""
                SELECT COUNT(*) FROM information_schema.columns
                WHERE table_schema = current_schema() AND table_name = 'todos' AND column_name = 'assigned_to_user_id'
            """))
            if result.scalar() > 0:
                print("[OK] assigned_to_user_id column already exists. Skipping.")
                return

            print("[...] Adding assigned_to_user_id column...")
            db.execute(text("ALTER TABLE todos ADD COLUMN assigned_to_user_id INTEGER NULL"))
            print("[...] Creating foreign key constraint...")
            db.execute(text("""
                ALTER TABLE todos 
                ADD CONSTRAINT FK_todos_assigned_to_user 
                FOREIGN KEY (assigned_to_user_id) REFERENCES users(id)
            """))

        else:
            print(f"[ERROR] Unknown database type. Please manually add the assigned_to_user_id column.")
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
    print("Running migration: Add assigned_to_user_id column to todos")
    print("=" * 50)
    run_migration()

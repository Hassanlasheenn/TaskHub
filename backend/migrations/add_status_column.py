"""
Migration script to add status column to todos table
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import text
from app.database import engine, SessionLocal

def run_migration():
    """Add status column to todos table"""
    db = SessionLocal()
    
    try:
        db_url = str(engine.url).lower()
        print(f"Database detected: {db_url[:50]}...")
        
        # Check if column already exists
        if 'sqlite' in db_url:
            result = db.execute(text("PRAGMA table_info(todos)"))
            columns = [row[1] for row in result]
            if 'status' in columns:
                print("Status column already exists. Skipping.")
                return
            
            print("Adding status column...")
            db.execute(text("ALTER TABLE todos ADD COLUMN status VARCHAR(20) DEFAULT 'new'"))
            
        elif 'mysql' in db_url or 'mariadb' in db_url:
            print("Adding status column...")
            db.execute(text("ALTER TABLE todos ADD COLUMN status VARCHAR(20) DEFAULT 'new'"))
            
        elif 'postgresql' in db_url or 'postgres' in db_url:
            print("Adding status column...")
            db.execute(text("ALTER TABLE todos ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'new'"))
            
        elif 'mssql' in db_url:
            # Check if column exists in SQL Server
            result = db.execute(text("""
                SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'todos' AND COLUMN_NAME = 'status'
            """))
            if result.scalar() > 0:
                print("Status column already exists. Skipping.")
                return
            
            print("Adding status column...")
            db.execute(text("ALTER TABLE todos ADD status NVARCHAR(20) DEFAULT 'new'"))
            
        else:
            print(f"Unknown database type. Please manually add the status column.")
            return
            
        db.commit()
        print("Migration completed successfully!")
        
    except Exception as e:
        print(f"Error during migration: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("Starting migration: Add status column to todos...")
    run_migration()

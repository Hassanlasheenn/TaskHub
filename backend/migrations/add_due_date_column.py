"""
Migration script to add due_date column to todos table
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from app.database import engine, SessionLocal

def run_migration():
    """Add due_date column to todos table"""
    db = SessionLocal()
    
    try:
        db_url = str(engine.url).lower()
        print(f"Database detected: {db_url[:50]}...")
        
        # Check if column already exists
        if 'mssql' in db_url or 'sqlserver' in db_url:
            # Check if column exists in SQL Server
            result = db.execute(text("""
                SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'todos' AND COLUMN_NAME = 'due_date'
            """))
            if result.scalar() > 0:
                print("[OK] due_date column already exists. Skipping.")
                return
            
            print("[...] Adding due_date column...")
            db.execute(text("ALTER TABLE todos ADD due_date DATETIME NULL"))
            
        elif 'sqlite' in db_url:
            result = db.execute(text("PRAGMA table_info(todos)"))
            columns = [row[1] for row in result]
            if 'due_date' in columns:
                print("[OK] due_date column already exists. Skipping.")
                return
            
            print("[...] Adding due_date column...")
            db.execute(text("ALTER TABLE todos ADD COLUMN due_date DATETIME"))
            
        elif 'mysql' in db_url or 'mariadb' in db_url:
            print("[...] Adding due_date column...")
            db.execute(text("ALTER TABLE todos ADD COLUMN due_date DATETIME NULL"))
            
        elif 'postgresql' in db_url or 'postgres' in db_url:
            print("[...] Adding due_date column...")
            db.execute(text("ALTER TABLE todos ADD COLUMN IF NOT EXISTS due_date TIMESTAMP"))
            
        else:
            print(f"[ERROR] Unknown database type. Please manually add the due_date column.")
            return
            
        db.commit()
        print("[OK] due_date column added successfully!")
        print("[SUCCESS] Migration completed successfully!")
        
    except Exception as e:
        print(f"[ERROR] Error during migration: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 50)
    print("Running migration: Add due_date column to todos")
    print("=" * 50)
    run_migration()

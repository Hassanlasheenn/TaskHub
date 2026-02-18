"""
Migration script to remove completed column from todos table and migrate data
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import text
from app.database import engine, SessionLocal
from app.models import TodoStatus

def run_migration():
    """Remove completed column from todos table after migrating data"""
    db = SessionLocal()
    
    try:
        db_url = str(engine.url).lower()
        print(f"Database detected: {db_url[:50]}...")
        
        if 'postgresql' in db_url or 'postgres' in db_url:
            print("Migrating completed todos to status='done'...")
            db.execute(text("UPDATE todos SET status = 'done' WHERE completed = 1 OR completed = true"))
            db.commit()
            
            print("Removing completed column...")
            db.execute(text("ALTER TABLE todos DROP COLUMN IF EXISTS completed"))
            db.commit()
            
        elif 'mssql' in db_url:
            print("Migrating completed todos to status='done'...")
            db.execute(text("UPDATE todos SET status = 'done' WHERE completed = 1"))
            db.commit()
            
            result = db.execute(text("""
                SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'todos' AND COLUMN_NAME = 'completed'
            """))
            if result.scalar() > 0:
                print("Removing completed column...")
                db.execute(text("ALTER TABLE todos DROP COLUMN completed"))
                db.commit()
            else:
                print("Completed column does not exist. Skipping.")
                
        elif 'mysql' in db_url or 'mariadb' in db_url:
            print("Migrating completed todos to status='done'...")
            db.execute(text("UPDATE todos SET status = 'done' WHERE completed = 1"))
            db.commit()
            
            print("Removing completed column...")
            db.execute(text("ALTER TABLE todos DROP COLUMN completed"))
            db.commit()
            
        elif 'sqlite' in db_url:
            print("Migrating completed todos to status='done'...")
            db.execute(text("UPDATE todos SET status = 'done' WHERE completed = 1"))
            db.commit()
            
            result = db.execute(text("PRAGMA table_info(todos)"))
            columns = [row[1] for row in result]
            if 'completed' in columns:
                print("SQLite does not support DROP COLUMN. Please recreate the table manually.")
                print("Or use a tool to recreate the table without the completed column.")
            else:
                print("Completed column does not exist.")
        else:
            print(f"Unknown database type. Please manually migrate and remove the completed column.")
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
    print("Starting migration: Remove completed column from todos...")
    run_migration()

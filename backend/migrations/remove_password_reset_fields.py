"""
Migration script to remove reset_token and reset_token_expires columns from users table
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
    """Remove reset_token and reset_token_expires columns from users table"""
    db = SessionLocal()
    
    try:
        db_url = str(engine.url).lower()
        print(f"Database detected: {db_url[:50]}...")
        
        if 'sqlite' in db_url:
            # SQLite doesn't support DROP COLUMN directly
            # You would need to recreate the table, which is complex
            print("[WARNING] SQLite doesn't support DROP COLUMN directly.")
            print("[WARNING] This migration requires manual intervention for SQLite.")
            print("[WARNING] Consider using a different database or recreating the table.")
            return
            
        elif 'mysql' in db_url or 'mariadb' in db_url:
            # Check if columns exist before dropping
            result = db.execute(text("""
                SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'reset_token'
            """))
            if result.scalar() > 0:
                print("[...] Dropping reset_token column...")
                db.execute(text("ALTER TABLE users DROP COLUMN reset_token"))
            else:
                print("[OK] reset_token column does not exist. Skipping.")
            
            result = db.execute(text("""
                SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'reset_token_expires'
            """))
            if result.scalar() > 0:
                print("[...] Dropping reset_token_expires column...")
                db.execute(text("ALTER TABLE users DROP COLUMN reset_token_expires"))
            else:
                print("[OK] reset_token_expires column does not exist. Skipping.")
            
        elif 'postgresql' in db_url or 'postgres' in db_url:
            # Check if columns exist before dropping
            result = db.execute(text("""
                SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'reset_token'
            """))
            if result.scalar() > 0:
                print("[...] Dropping reset_token column...")
                db.execute(text("ALTER TABLE users DROP COLUMN IF EXISTS reset_token"))
            else:
                print("[OK] reset_token column does not exist. Skipping.")
            
            result = db.execute(text("""
                SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'reset_token_expires'
            """))
            if result.scalar() > 0:
                print("[...] Dropping reset_token_expires column...")
                db.execute(text("ALTER TABLE users DROP COLUMN IF EXISTS reset_token_expires"))
            else:
                print("[OK] reset_token_expires column does not exist. Skipping.")
            
        elif 'mssql' in db_url or 'sqlserver' in db_url:
            # SQL Server: Check if columns exist before dropping
            # Also need to drop indexes if they exist
            
            # Check for reset_token column
            result = db.execute(text("""
                SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'reset_token'
            """))
            if result.scalar() > 0:
                # Drop index if it exists (SQL Server requires dropping index before column)
                # Check if index exists
                index_result = db.execute(text("""
                    SELECT COUNT(*) FROM sys.indexes 
                    WHERE object_id = OBJECT_ID('users') 
                    AND name LIKE '%reset_token%'
                """))
                if index_result.scalar() > 0:
                    # Get index name
                    index_name_result = db.execute(text("""
                        SELECT name FROM sys.indexes 
                        WHERE object_id = OBJECT_ID('users') 
                        AND name LIKE '%reset_token%'
                    """))
                    index_names = [row[0] for row in index_name_result]
                    for index_name in index_names:
                        try:
                            db.execute(text(f"DROP INDEX {index_name} ON users"))
                            print(f"[...] Dropped index {index_name} on reset_token column...")
                        except Exception as e:
                            print(f"[WARNING] Could not drop index {index_name}: {e}")
                
                print("[...] Dropping reset_token column...")
                db.execute(text("ALTER TABLE users DROP COLUMN reset_token"))
            else:
                print("[OK] reset_token column does not exist. Skipping.")
            
            # Check for reset_token_expires column
            result = db.execute(text("""
                SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'reset_token_expires'
            """))
            if result.scalar() > 0:
                print("[...] Dropping reset_token_expires column...")
                db.execute(text("ALTER TABLE users DROP COLUMN reset_token_expires"))
            else:
                print("[OK] reset_token_expires column does not exist. Skipping.")
        else:
            print(f"[WARNING] Unknown database type: {db_url}")
            print("[WARNING] Please manually remove the columns:")
            print("  - reset_token")
            print("  - reset_token_expires")
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
    print("Running migration: Remove password reset fields")
    print("=" * 50)
    run_migration()

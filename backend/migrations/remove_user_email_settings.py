"""
Migration script to remove user email/SMTP settings columns from users table
Removes: smtp_username, smtp_password, smtp_server, smtp_port, smtp_use_tls
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
    """Remove SMTP email settings columns from users table"""
    db = SessionLocal()
    
    try:
        db_url = str(engine.url).lower()
        print(f"Database detected: {db_url[:50]}...")
        
        columns_to_remove = [
            'smtp_username',
            'smtp_password',
            'smtp_server',
            'smtp_port',
            'smtp_use_tls'
        ]
        
        if 'sqlite' in db_url:
            # SQLite doesn't support DROP COLUMN directly
            print("[WARNING] SQLite doesn't support DROP COLUMN directly.")
            print("[WARNING] This migration requires manual intervention for SQLite.")
            print("[WARNING] Consider using a different database or recreating the table.")
            return
            
        elif 'mysql' in db_url or 'mariadb' in db_url:
            for column_name in columns_to_remove:
                result = db.execute(text(f"""
                    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = '{column_name}'
                """))
                if result.scalar() > 0:
                    print(f"[...] Dropping {column_name} column...")
                    db.execute(text(f"ALTER TABLE users DROP COLUMN {column_name}"))
                else:
                    print(f"[OK] {column_name} column does not exist. Skipping.")
            
        elif 'postgresql' in db_url or 'postgres' in db_url:
            for column_name in columns_to_remove:
                result = db.execute(text(f"""
                    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_NAME = 'users' AND COLUMN_NAME = '{column_name}'
                """))
                if result.scalar() > 0:
                    print(f"[...] Dropping {column_name} column...")
                    db.execute(text(f"ALTER TABLE users DROP COLUMN IF EXISTS {column_name}"))
                else:
                    print(f"[OK] {column_name} column does not exist. Skipping.")
            
        elif 'mssql' in db_url or 'sqlserver' in db_url:
            # SQL Server: Check if columns exist before dropping
            # Need to drop default constraints first
            for column_name in columns_to_remove:
                result = db.execute(text(f"""
                    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_NAME = 'users' AND COLUMN_NAME = '{column_name}'
                """))
                if result.scalar() > 0:
                    # Check for default constraints on this column
                    constraint_result = db.execute(text(f"""
                        SELECT dc.name 
                        FROM sys.default_constraints dc
                        INNER JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
                        WHERE c.object_id = OBJECT_ID('users') AND c.name = '{column_name}'
                    """))
                    constraints = [row[0] for row in constraint_result]
                    
                    # Drop default constraints first
                    for constraint_name in constraints:
                        try:
                            print(f"[...] Dropping default constraint {constraint_name} on {column_name}...")
                            db.execute(text(f"ALTER TABLE users DROP CONSTRAINT {constraint_name}"))
                        except Exception as e:
                            print(f"[WARNING] Could not drop constraint {constraint_name}: {e}")
                    
                    print(f"[...] Dropping {column_name} column...")
                    db.execute(text(f"ALTER TABLE users DROP COLUMN {column_name}"))
                else:
                    print(f"[OK] {column_name} column does not exist. Skipping.")
        else:
            print(f"[WARNING] Unknown database type: {db_url}")
            print("[WARNING] Please manually remove the columns:")
            for col in columns_to_remove:
                print(f"  - {col}")
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
    print("Running migration: Remove user email/SMTP settings")
    print("=" * 50)
    run_migration()

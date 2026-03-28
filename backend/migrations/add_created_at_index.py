"""
Migration script to add index on todos.created_at for efficient sort queries
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from app.database import engine, SessionLocal


def run_migration():
    """Add index on todos.created_at"""
    db = SessionLocal()
    try:
        db_url = str(engine.url).lower()
        print(f"Database detected: {db_url[:50]}...")

        if 'postgresql' in db_url or 'postgres' in db_url:
            db.execute(text("""
                CREATE INDEX IF NOT EXISTS ix_todos_created_at ON todos (created_at DESC)
            """))
        elif 'sqlite' in db_url:
            result = db.execute(text(
                "SELECT name FROM sqlite_master WHERE type='index' AND name='ix_todos_created_at'"
            ))
            if result.fetchone():
                print("[OK] ix_todos_created_at index already exists. Skipping.")
                return
            db.execute(text("CREATE INDEX ix_todos_created_at ON todos (created_at DESC)"))
        elif 'mysql' in db_url or 'mariadb' in db_url:
            result = db.execute(text(
                "SELECT COUNT(*) FROM information_schema.statistics "
                "WHERE table_schema=DATABASE() AND table_name='todos' AND index_name='ix_todos_created_at'"
            ))
            if result.scalar() > 0:
                print("[OK] ix_todos_created_at index already exists. Skipping.")
                return
            db.execute(text("CREATE INDEX ix_todos_created_at ON todos (created_at DESC)"))
        elif 'mssql' in db_url or 'sqlserver' in db_url:
            result = db.execute(text(
                "SELECT COUNT(*) FROM sys.indexes WHERE name='ix_todos_created_at' AND object_id=OBJECT_ID('todos')"
            ))
            if result.scalar() > 0:
                print("[OK] ix_todos_created_at index already exists. Skipping.")
                return
            db.execute(text("CREATE INDEX ix_todos_created_at ON todos (created_at DESC)"))
        else:
            print("[ERROR] Unknown database type.")
            return

        db.commit()
        print("[OK] ix_todos_created_at index created successfully!")
        print("[SUCCESS] Migration completed successfully!")
    except Exception as e:
        print(f"[ERROR] Error during migration: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("=" * 50)
    print("Running migration: Add created_at index on todos")
    print("=" * 50)
    run_migration()

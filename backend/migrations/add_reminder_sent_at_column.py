from sqlalchemy import text
from app.database import engine

def migrate():
    print("Adding reminder_sent_at column to todos table...")
    
    # Check if column exists first (SQLite doesn't support IF NOT EXISTS in ALTER TABLE)
    try:
        with engine.connect() as conn:
            # Check for PostgreSQL/Standard SQL
            conn.execute(text("ALTER TABLE todos ADD COLUMN reminder_sent_at TIMESTAMP;"))
            conn.commit()
            print("Successfully added reminder_sent_at column.")
    except Exception as e:
        # SQLite or column already exists
        error_msg = str(e)
        if "already exists" in error_msg.lower() or "duplicate column" in error_msg.lower():
            print("Column reminder_sent_at already exists, skipping.")
        else:
            # Try SQLite format
            try:
                with engine.connect() as conn:
                    conn.execute(text("ALTER TABLE todos ADD COLUMN reminder_sent_at DATETIME;"))
                    conn.commit()
                    print("Successfully added reminder_sent_at column (SQLite).")
            except Exception as e2:
                print(f"Failed to add column: {e2}")

if __name__ == "__main__":
    migrate()

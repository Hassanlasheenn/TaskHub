import secrets

def generate_admin_key():
    """Generate a secure admin registration key"""
    # Generate a 32-character random key
    admin_key = secrets.token_urlsafe(24)
    
    print("=" * 60)
    print("Generated ADMIN_REGISTRATION_KEY")
    print("=" * 60)
    print("Add this to your .env file:")
    print(f"ADMIN_REGISTRATION_KEY={admin_key}")
    print()
    print("IMPORTANT: Keep this key secure!")
    print("Anyone with this key can register as an admin.")
    print("Share it only with trusted individuals.")
    print("=" * 60)

if __name__ == "__main__":
    generate_admin_key()

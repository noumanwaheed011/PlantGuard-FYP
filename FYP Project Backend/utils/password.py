"""Password hashing utilities."""
import bcrypt


def hash_password(password):
    """
    Hash a password using bcrypt.
    
    Args:
        password: Plain text password
    
    Returns:
        str: Hashed password
    """
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(password, hashed):
    """
    Verify a password against a hash.
    
    Args:
        password: Plain text password
        hashed: Hashed password
    
    Returns:
        bool: True if password matches, False otherwise
    """
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except Exception:
        return False

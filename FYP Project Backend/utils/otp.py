"""OTP generation and validation utilities."""
import random
import secrets
from datetime import datetime, timedelta


def generate_otp(length=6):
    """
    Generate a secure random OTP.
    
    Args:
        length: Length of OTP (default: 6)
    
    Returns:
        str: OTP code
    """
    return ''.join([str(secrets.randbelow(10)) for _ in range(length)])


def get_otp_expiry(minutes=5):
    """
    Get OTP expiry datetime.
    
    Args:
        minutes: Minutes until expiry (default: 5)
    
    Returns:
        datetime: Expiry datetime
    """
    return datetime.utcnow() + timedelta(minutes=minutes)


def is_otp_expired(expires_at):
    """
    Check if OTP is expired.
    
    Args:
        expires_at: Expiry datetime
    
    Returns:
        bool: True if expired, False otherwise
    """
    return datetime.utcnow() > expires_at

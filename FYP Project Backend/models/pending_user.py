"""Pending user model (temporary storage before OTP verification)."""
from datetime import datetime
from config.database import get_db


class PendingUser:
    """Pending user model for temporary storage before OTP verification."""
    
    @staticmethod
    def create(email, name, password_hash):
        """
        Create a pending user record.
        
        Args:
            email: User email
            name: User name
            password_hash: Hashed password
        
        Returns:
            dict: Pending user document
        """
        db = get_db()
        pending_user = {
            'email': email.lower(),
            'name': name,
            'password': password_hash,
            'createdAt': datetime.utcnow()
        }
        # Delete existing pending user for this email
        db.pending_users.delete_many({'email': email.lower()})
        # Insert new pending user
        result = db.pending_users.insert_one(pending_user)
        pending_user['_id'] = result.inserted_id
        return pending_user
    
    @staticmethod
    def find_by_email(email):
        """Find pending user by email."""
        db = get_db()
        return db.pending_users.find_one({'email': email.lower()})
    
    @staticmethod
    def delete(email):
        """Delete pending user record."""
        db = get_db()
        db.pending_users.delete_many({'email': email.lower()})

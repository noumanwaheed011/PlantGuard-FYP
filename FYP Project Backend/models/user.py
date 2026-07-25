"""User model and database operations."""
from datetime import datetime
from bson import ObjectId
from config.database import get_db


class User:
    """User model and database operations."""
    
    @staticmethod
    def find_by_email(email):
        """Find user by email."""
        db = get_db()
        return db.users.find_one({'email': email.lower()})
    
    @staticmethod
    def find_by_id(user_id):
        """Find user by ID."""
        db = get_db()
        return db.users.find_one({'_id': ObjectId(user_id)})
    
    @staticmethod
    def create(email, name, password_hash):
        """
        Create a new user.
        
        Args:
            email: User email
            name: User name
            password_hash: Hashed password
        
        Returns:
            dict: Created user document
        """
        db = get_db()
        user = {
            'email': email.lower(),
            'name': name,
            'password': password_hash,
            'isVerified': False,
            'isAdmin': False,
            'profileImage': None,
            'analyses': [],
            'createdAt': datetime.utcnow(),
            'updatedAt': datetime.utcnow()
        }
        result = db.users.insert_one(user)
        user['_id'] = result.inserted_id
        user['id'] = str(result.inserted_id)
        return user
    
    @staticmethod
    def update(user_id, updates):
        """Update user fields."""
        db = get_db()
        updates['updatedAt'] = datetime.utcnow()
        result = db.users.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': updates}
        )
        return result.modified_count > 0
    
    @staticmethod
    def mark_verified(email):
        """Mark user as verified."""
        db = get_db()
        db.users.update_one(
            {'email': email.lower()},
            {'$set': {'isVerified': True, 'updatedAt': datetime.utcnow()}}
        )
    
    @staticmethod
    def to_dict(user_doc):
        """Convert user document to safe dict (exclude password)."""
        if not user_doc:
            return None
        
        user = {
            'id': str(user_doc['_id']),
            'email': user_doc.get('email'),
            'name': user_doc.get('name'),
            'isVerified': user_doc.get('isVerified', False),
            'isAdmin': user_doc.get('isAdmin', False),
            'profileImage': user_doc.get('profileImage'),
            'analyses': user_doc.get('analyses', []),
            'createdAt': user_doc.get('createdAt').isoformat() if user_doc.get('createdAt') else None
        }
        return user

"""MongoDB database configuration and connection."""
import os
from datetime import datetime
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
MONGODB_DB_NAME = os.getenv('MONGODB_DB_NAME', 'plantguard_db')

# Global MongoDB client
_client = None
_db = None


def get_db():
    """Get MongoDB database instance. Creates connection if not exists."""
    global _client, _db
    
    if _db is not None:
        return _db
    
    try:
        _client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        # Test connection
        _client.admin.command('ping')
        _db = _client[MONGODB_DB_NAME]
        
        # Ensure collections and indexes exist
        _ensure_collections_and_indexes(_db)
        
        print(f"✓ Connected to MongoDB: {MONGODB_DB_NAME}")
        return _db
    except ConnectionFailure as e:
        print(f"✗ MongoDB connection failed: {e}")
        raise


def _ensure_collections_and_indexes(db):
    """Create collections and indexes if they don't exist."""
    # Users collection
    users = db.users
    users.create_index("email", unique=True)
    users.create_index("createdAt")
    
    # Pending users collection (temporary before OTP verification)
    pending_users = db.pending_users
    pending_users.create_index("email", unique=True)
    pending_users.create_index("createdAt", expireAfterSeconds=3600)  # Auto-delete after 1 hour
    
    # OTP verifications collection
    otp_verifications = db.otp_verifications
    otp_verifications.create_index("email")
    otp_verifications.create_index("expiresAt", expireAfterSeconds=0)  # TTL index for auto-deletion
    
    # Analyses collection
    analyses = db.analyses
    analyses.create_index("userId")
    analyses.create_index("createdAt")
    
    # Detections collection (for admin)
    detections = db.detections
    detections.create_index("userId")
    detections.create_index("createdAt")

    # Feedback collection
    feedback = db.feedback
    feedback.create_index("userId")
    feedback.create_index("analysisId")
    feedback.create_index("createdAt")

    _ensure_admin_user(db)
    
    print("✓ Collections and indexes ensured")


def _ensure_admin_user(db):
    """Create the default admin account if it does not exist yet."""
    from utils.password import hash_password

    admin_email = os.getenv('ADMIN_EMAIL', 'admin@plantguard.ai').lower()
    admin_password = os.getenv('ADMIN_PASSWORD', 'Admin@12345')
    admin_name = os.getenv('ADMIN_NAME', 'Admin')

    existing = db.users.find_one({'email': admin_email})
    if not existing:
        db.users.insert_one({
            'email': admin_email,
            'name': admin_name,
            'password': hash_password(admin_password),
            'isVerified': True,
            'isAdmin': True,
            'profileImage': None,
            'analyses': [],
            'createdAt': datetime.utcnow(),
            'updatedAt': datetime.utcnow(),
        })
        print(f"✓ Default admin user created ({admin_email})")
        return

    updates = {}
    if not existing.get('isAdmin'):
        updates['isAdmin'] = True
    if not existing.get('isVerified'):
        updates['isVerified'] = True
    if updates:
        updates['updatedAt'] = datetime.utcnow()
        db.users.update_one({'email': admin_email}, {'$set': updates})
        print(f"✓ Admin privileges ensured for {admin_email}")


def close_db():
    """Close MongoDB connection."""
    global _client
    if _client:
        _client.close()
        print("✓ MongoDB connection closed")

"""Feedback model and database operations."""
from datetime import datetime
from bson import ObjectId
from config.database import get_db


class Feedback:
    """Feedback model and database operations."""

    @staticmethod
    def create(user_id, feedback_data):
        """Create a new feedback record."""
        db = get_db()
        feedback = {
            'userId': ObjectId(user_id),
            'userEmail': feedback_data.get('userEmail'),
            'userName': feedback_data.get('userName'),
            'analysisId': ObjectId(feedback_data['analysisId']) if feedback_data.get('analysisId') else None,
            'diseaseName': feedback_data.get('diseaseName'),
            'rating': feedback_data.get('rating'),
            'comment': feedback_data.get('comment', ''),
            'createdAt': datetime.utcnow(),
        }
        result = db.feedback.insert_one(feedback)
        feedback['_id'] = result.inserted_id
        return feedback

    @staticmethod
    def find_by_analysis_and_user(analysis_id, user_id):
        """Check if the user already submitted feedback for an analysis."""
        if not analysis_id:
            return None
        db = get_db()
        return db.feedback.find_one({
            'analysisId': ObjectId(analysis_id),
            'userId': ObjectId(user_id),
        })

    @staticmethod
    def get_all(limit=100, skip=0):
        """Get all feedback entries (admin)."""
        db = get_db()
        return list(db.feedback.find({}).sort('createdAt', -1).limit(limit).skip(skip))

    @staticmethod
    def get_user_feedback(user_id):
        """Get feedback submitted by a specific user."""
        db = get_db()
        return list(db.feedback.find({'userId': ObjectId(user_id)}).sort('createdAt', -1))

    @staticmethod
    def to_dict(doc):
        """Convert feedback document to dict."""
        if not doc:
            return None

        return {
            'id': str(doc['_id']),
            'userId': str(doc['userId']) if doc.get('userId') else None,
            'userEmail': doc.get('userEmail'),
            'userName': doc.get('userName'),
            'analysisId': str(doc['analysisId']) if doc.get('analysisId') else None,
            'diseaseName': doc.get('diseaseName'),
            'rating': doc.get('rating'),
            'comment': doc.get('comment', ''),
            'createdAt': doc.get('createdAt').isoformat() if doc.get('createdAt') else None,
        }

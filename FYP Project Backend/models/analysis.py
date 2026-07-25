"""Analysis model and database operations."""
from datetime import datetime
from bson import ObjectId
from config.database import get_db


class Analysis:
    """Analysis model and database operations."""
    
    @staticmethod
    def create(user_id, result_data):
        """
        Create a new analysis record.
        
        Args:
            user_id: User ID
            result_data: Analysis result data
        
        Returns:
            dict: Created analysis document
        """
        db = get_db()
        analysis = {
            'userId': ObjectId(user_id),
            'diseaseName': result_data.get('diseaseName'),
            'confidence': result_data.get('confidence'),
            'description': result_data.get('description'),
            'careSteps': result_data.get('careSteps', []),
            'recommendations': result_data.get('recommendations', {}),
            'imagePath': result_data.get('imagePath'),
            'createdAt': datetime.utcnow()
        }
        result = db.analyses.insert_one(analysis)
        analysis['_id'] = result.inserted_id
        analysis['id'] = str(result.inserted_id)
        
        # Also add to detections collection for admin
        detection = {
            'userId': ObjectId(user_id),
            'userEmail': result_data.get('userEmail'),
            'userName': result_data.get('userName'),
            'diseaseName': result_data.get('diseaseName'),
            'confidence': result_data.get('confidence'),
            'date': datetime.utcnow()
        }
        db.detections.insert_one(detection)
        
        return analysis
    
    @staticmethod
    def get_user_analyses(user_id):
        """Get all analyses for a user."""
        db = get_db()
        analyses = list(db.analyses.find(
            {'userId': ObjectId(user_id)},
            sort=[('createdAt', -1)]
        ))
        
        # Convert to list of dicts
        result = []
        for analysis in analyses:
            result.append({
                'id': str(analysis['_id']),
                'diseaseName': analysis.get('diseaseName'),
                'confidence': analysis.get('confidence'),
                'description': analysis.get('description'),
                'careSteps': analysis.get('careSteps', []),
                'recommendations': analysis.get('recommendations', {}),
                'date': analysis.get('createdAt').isoformat() if analysis.get('createdAt') else None
            })
        
        return result
    
    @staticmethod
    def to_dict(analysis_doc):
        """Convert analysis document to dict."""
        if not analysis_doc:
            return None
        
        return {
            'id': str(analysis_doc['_id']),
            'diseaseName': analysis_doc.get('diseaseName'),
            'confidence': analysis_doc.get('confidence'),
            'description': analysis_doc.get('description'),
            'careSteps': analysis_doc.get('careSteps', []),
            'recommendations': analysis_doc.get('recommendations', {}),
            'date': analysis_doc.get('createdAt').isoformat() if analysis_doc.get('createdAt') else None
        }

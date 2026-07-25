"""Admin routes."""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.feedback import Feedback
from config.database import get_db
from bson import ObjectId

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')


def is_admin():
    """Check if current user is admin."""
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    return user and user.get('isAdmin', False)


@admin_bp.route('/analyses', methods=['GET'], endpoint='get_analyses')
@jwt_required()
def get_analyses():
    """Get all analysis records (admin only)."""
    try:
        if not is_admin():
            return jsonify({'error': 'Admin access required'}), 403

        db = get_db()
        limit = int(request.args.get('limit', 200))
        skip = int(request.args.get('skip', 0))

        analyses = list(db.analyses.find({}).sort('createdAt', -1).limit(limit).skip(skip))

        result = []
        for item in analyses:
            user_id = item.get('userId')
            user_doc = db.users.find_one({'_id': user_id}, {'email': 1, 'name': 1}) if user_id else None
            result.append({
                'id': str(item['_id']),
                'userName': user_doc.get('name') if user_doc else None,
                'userEmail': user_doc.get('email') if user_doc else None,
                'diseaseName': item.get('diseaseName'),
                'confidence': item.get('confidence'),
                'description': item.get('description'),
                'imagePath': item.get('imagePath'),
                'date': item.get('createdAt').isoformat() if item.get('createdAt') else None,
            })

        return jsonify({'analyses': result}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/users', methods=['GET'], endpoint='get_users')
@jwt_required()
def get_users():
    """Get all users (admin only)."""
    try:
        if not is_admin():
            return jsonify({'error': 'Admin access required'}), 403
        
        db = get_db()
        users = list(db.users.find({}, {'password': 0}).sort('createdAt', -1))
        
        result = []
        for user in users:
            result.append({
                'email': user.get('email'),
                'name': user.get('name'),
                'isVerified': user.get('isVerified', False),
                'isAdmin': user.get('isAdmin', False),
                'createdAt': user.get('createdAt').isoformat() if user.get('createdAt') else None
            })
        
        return jsonify({'users': result}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/detections', methods=['GET'], endpoint='get_detections')
@jwt_required()
def get_detections():
    """Get all detections (admin only)."""
    try:
        if not is_admin():
            return jsonify({'error': 'Admin access required'}), 403
        
        db = get_db()
        limit = int(request.args.get('limit', 100))
        skip = int(request.args.get('skip', 0))
        
        detections = list(db.detections.find({}).sort('date', -1).limit(limit).skip(skip))
        
        result = []
        for detection in detections:
            result.append({
                'id': str(detection['_id']),
                'userName': detection.get('userName'),
                'userEmail': detection.get('userEmail'),
                'diseaseName': detection.get('diseaseName'),
                'confidence': detection.get('confidence'),
                'date': detection.get('date').isoformat() if detection.get('date') else None
            })
        
        return jsonify({'detections': result}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/stats', methods=['GET'], endpoint='get_stats')
@jwt_required()
def get_stats():
    """Get admin statistics (admin only)."""
    try:
        if not is_admin():
            return jsonify({'error': 'Admin access required'}), 403
        
        db = get_db()
        
        total_users = db.users.count_documents({})
        total_detections = db.detections.count_documents({})
        total_feedback = db.feedback.count_documents({})
        verified_users = db.users.count_documents({'isVerified': True})
        
        return jsonify({
            'totalUsers': total_users,
            'verifiedUsers': verified_users,
            'totalDetections': total_detections,
            'totalFeedback': total_feedback,
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/feedback', methods=['GET'], endpoint='get_feedback')
@jwt_required()
def get_feedback():
    """Get all user feedback (admin only)."""
    try:
        if not is_admin():
            return jsonify({'error': 'Admin access required'}), 403

        limit = int(request.args.get('limit', 100))
        skip = int(request.args.get('skip', 0))
        feedback_list = Feedback.get_all(limit=limit, skip=skip)

        result = [Feedback.to_dict(item) for item in feedback_list]
        return jsonify({'feedback': result}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

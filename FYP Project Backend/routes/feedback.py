"""Feedback routes."""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.feedback import Feedback

feedback_bp = Blueprint('feedback', __name__, url_prefix='/api/feedback')


@feedback_bp.route('', methods=['POST'])
@jwt_required()
def submit_feedback():
    """Submit feedback for an analysis result."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}

        rating = data.get('rating')
        try:
            rating = int(rating)
        except (TypeError, ValueError):
            return jsonify({'error': 'Rating must be an integer between 1 and 5'}), 400

        if rating < 1 or rating > 5:
            return jsonify({'error': 'Rating must be an integer between 1 and 5'}), 400

        disease_name = (data.get('diseaseName') or '').strip()
        if not disease_name:
            return jsonify({'error': 'Disease name is required'}), 400

        analysis_id = data.get('analysisId')
        comment = (data.get('comment') or '').strip()

        user = User.find_by_id(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        if analysis_id:
            existing = Feedback.find_by_analysis_and_user(analysis_id, user_id)
            if existing:
                return jsonify({
                    'message': 'Feedback already submitted for this analysis',
                    'feedback': Feedback.to_dict(existing),
                }), 200

        feedback = Feedback.create(user_id, {
            'analysisId': analysis_id,
            'userEmail': user.get('email'),
            'userName': user.get('name'),
            'diseaseName': disease_name,
            'rating': rating,
            'comment': comment,
        })

        return jsonify(Feedback.to_dict(feedback)), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@feedback_bp.route('/mine', methods=['GET'])
@jwt_required()
def get_my_feedback():
    """Return feedback submitted by the current user."""
    try:
        user_id = get_jwt_identity()
        feedback_list = Feedback.get_user_feedback(user_id)
        result = [Feedback.to_dict(item) for item in feedback_list]
        return jsonify({'feedback': result}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

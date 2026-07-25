"""User profile and account routes."""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from utils.password import hash_password, verify_password

user_bp = Blueprint('user', __name__, url_prefix='/api/user')


@user_bp.route('/profile', methods=['GET'], endpoint='get_profile')
@jwt_required()
def get_profile():
    """Get user profile."""
    try:
        user_id = get_jwt_identity()
        user = User.find_by_id(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        user_dict = User.to_dict(user)
        return jsonify({'user': user_dict}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@user_bp.route('/profile', methods=['PUT'], endpoint='update_profile')
@jwt_required()
def update_profile():
    """Update user profile."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        updates = {}
        if 'name' in data:
            updates['name'] = data['name'].strip()
        if 'fullName' in data:
            updates['name'] = data['fullName'].strip()
        if 'profileImage' in data:
            updates['profileImage'] = data['profileImage']
        
        if not updates:
            return jsonify({'error': 'No fields to update'}), 400
        
        success = User.update(user_id, updates)
        if not success:
            return jsonify({'error': 'Failed to update profile'}), 500
        
        # Return updated user
        user = User.find_by_id(user_id)
        user_dict = User.to_dict(user)
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user_dict
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@user_bp.route('/password', methods=['PUT'], endpoint='change_password')
@jwt_required()
def change_password():
    """Change user password."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        current_password = data.get('currentPassword', '').strip()
        new_password = data.get('newPassword', '').strip()
        
        if not current_password or not new_password:
            return jsonify({'error': 'Current password and new password are required'}), 400
        
        # Password validation - match frontend requirements
        if len(new_password) < 8:
            return jsonify({'error': 'New password must be at least 8 characters'}), 400
        if not any(c.isalpha() for c in new_password):
            return jsonify({'error': 'New password must contain at least one letter'}), 400
        if not any(c.isdigit() for c in new_password):
            return jsonify({'error': 'New password must contain at least one number'}), 400
        
        # Get user
        user = User.find_by_id(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Verify current password
        if not verify_password(current_password, user.get('password')):
            return jsonify({'error': 'Current password is incorrect'}), 401
        
        # Update password
        new_password_hash = hash_password(new_password)
        success = User.update(user_id, {'password': new_password_hash})
        
        if not success:
            return jsonify({'error': 'Failed to change password'}), 500
        
        return jsonify({'message': 'Password changed successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@user_bp.route('/analyses', methods=['GET'], endpoint='get_analyses')
@jwt_required()
def get_analyses():
    """Get user's past analyses."""
    try:
        user_id = get_jwt_identity()
        from models.analysis import Analysis
        
        analyses = Analysis.get_user_analyses(user_id)
        
        return jsonify({'analyses': analyses}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

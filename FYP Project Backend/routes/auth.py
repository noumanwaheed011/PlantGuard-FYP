"""Authentication routes."""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models.user import User
from models.otp import OTPVerification
from models.pending_user import PendingUser
from utils.password import hash_password, verify_password
from utils.otp import generate_otp, get_otp_expiry, is_otp_expired
from config.email import send_otp_email, send_password_reset_email
from datetime import timedelta

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


def validate_password(password):
    """Validate password strength."""
    if len(password) < 8:
        return 'Password must be at least 8 characters'
    if not any(c.isalpha() for c in password):
        return 'Password must contain at least one letter'
    if not any(c.isdigit() for c in password):
        return 'Password must contain at least one number'
    return None


@auth_bp.route('/signup', methods=['POST'])
def signup():
    """User registration endpoint."""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        name = data.get('name', '').strip() or data.get('fullName', '').strip()
        password = data.get('password', '').strip()
        
        # Validation
        if not email or not name or not password:
            return jsonify({'error': 'Email, name, and password are required'}), 400
        
        # Password validation - match frontend requirements
        password_error = validate_password(password)
        if password_error:
            return jsonify({'error': password_error}), 400
        
        # Check if email already exists
        existing_user = User.find_by_email(email)
        if existing_user:
            return jsonify({'error': 'This email is already registered.'}), 400
        
        # Hash password
        password_hash = hash_password(password)
        
        # Store pending user (temporary until OTP verification)
        PendingUser.create(email, name, password_hash)
        
        # Generate OTP
        otp_code = generate_otp(6)
        expires_at = get_otp_expiry(5)  # 5 minutes expiry
        
        # Store OTP
        OTPVerification.create(email, otp_code, expires_at)
        
        # Send OTP email
        send_otp_email(email, otp_code, name)
        
        return jsonify({
            'message': 'OTP sent to your email. Please verify to complete registration.',
            'email': email
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    """Verify OTP and create user account."""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        otp = data.get('otp', '').strip()
        
        if not email or not otp:
            return jsonify({'error': 'Email and OTP are required'}), 400
        
        # Verify OTP
        otp_doc = OTPVerification.find_by_email(email, purpose='signup')
        if not otp_doc:
            return jsonify({'error': 'Invalid OTP. Please request a new one.'}), 400
        
        if otp_doc.get('verified'):
            return jsonify({'error': 'OTP already used. Please request a new one.'}), 400
        
        if is_otp_expired(otp_doc.get('expiresAt')):
            return jsonify({'error': 'OTP expired. Please request a new one.'}), 400
        
        if otp_doc.get('otp') != otp:
            return jsonify({'error': 'Invalid OTP. Please try again.'}), 400
        
        # Get pending user data
        pending_user = PendingUser.find_by_email(email)
        if not pending_user:
            return jsonify({'error': 'Registration session expired. Please sign up again.'}), 400
        
        # Check if user already exists (race condition check)
        existing_user = User.find_by_email(email)
        if existing_user:
            PendingUser.delete(email)
            OTPVerification.delete(email)
            return jsonify({'error': 'This email is already registered.'}), 400
        
        # Create user from pending user data
        user = User.create(
            email,
            pending_user.get('name'),
            pending_user.get('password')
        )
        
        # Mark OTP as verified and mark user as verified
        OTPVerification.verify(email, otp, purpose='signup')
        User.mark_verified(email)
        
        # Clean up OTP and pending user
        OTPVerification.delete(email, purpose='signup')
        PendingUser.delete(email)
        
        # Generate JWT token
        access_token = create_access_token(
            identity=str(user['_id']),
            expires_delta=timedelta(days=30)
        )
        
        user_dict = User.to_dict(user)
        
        return jsonify({
            'message': 'Account created successfully',
            'token': access_token,
            'user': user_dict
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/resend-otp', methods=['POST'])
def resend_otp():
    """Resend OTP to user email."""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        # Check if user already exists
        existing_user = User.find_by_email(email)
        if existing_user:
            return jsonify({'error': 'This email is already registered.'}), 400
        
        # Generate new OTP
        otp_code = generate_otp(6)
        expires_at = get_otp_expiry(5)
        
        # Store OTP
        OTPVerification.create(email, otp_code, expires_at, purpose='signup')
        
        # Send OTP email
        send_otp_email(email, otp_code)
        
        return jsonify({
            'message': 'OTP resent to your email'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Send a password reset OTP to a registered email."""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()

        if not email:
            return jsonify({'error': 'Email is required'}), 400

        user = User.find_by_email(email)
        if not user:
            return jsonify({'error': 'No account found with this email.'}), 404

        otp_code = generate_otp(6)
        expires_at = get_otp_expiry(5)
        OTPVerification.create(email, otp_code, expires_at, purpose='password_reset')
        send_password_reset_email(email, otp_code, user.get('name'))

        return jsonify({
            'message': 'Password reset OTP sent to your email.',
            'email': email,
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/forgot-password/resend', methods=['POST'])
def resend_forgot_password_otp():
    """Resend password reset OTP."""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()

        if not email:
            return jsonify({'error': 'Email is required'}), 400

        user = User.find_by_email(email)
        if not user:
            return jsonify({'error': 'No account found with this email.'}), 404

        otp_code = generate_otp(6)
        expires_at = get_otp_expiry(5)
        OTPVerification.create(email, otp_code, expires_at, purpose='password_reset')
        send_password_reset_email(email, otp_code, user.get('name'))

        return jsonify({'message': 'Password reset OTP resent to your email.'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Verify reset OTP and set a new password."""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        otp = data.get('otp', '').strip()
        new_password = data.get('newPassword', '').strip()

        if not email or not otp or not new_password:
            return jsonify({'error': 'Email, OTP, and new password are required'}), 400

        password_error = validate_password(new_password)
        if password_error:
            return jsonify({'error': password_error}), 400

        otp_doc = OTPVerification.find_by_email(email, purpose='password_reset')
        if not otp_doc:
            return jsonify({'error': 'Invalid OTP. Please request a new one.'}), 400

        if otp_doc.get('verified'):
            return jsonify({'error': 'OTP already used. Please request a new one.'}), 400

        if is_otp_expired(otp_doc.get('expiresAt')):
            return jsonify({'error': 'OTP expired. Please request a new one.'}), 400

        if otp_doc.get('otp') != otp:
            return jsonify({'error': 'Invalid OTP. Please try again.'}), 400

        user = User.find_by_email(email)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        new_password_hash = hash_password(new_password)
        success = User.update(str(user['_id']), {'password': new_password_hash})
        if not success:
            return jsonify({'error': 'Failed to reset password'}), 500

        OTPVerification.delete(email, purpose='password_reset')

        return jsonify({'message': 'Password reset successfully. You can now log in.'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """User login endpoint."""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '').strip()
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Find user
        user = User.find_by_email(email)
        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Verify password
        if not verify_password(password, user.get('password')):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Check if verified
        if not user.get('isVerified'):
            return jsonify({'error': 'Please verify your email first'}), 403
        
        # Generate JWT token
        access_token = create_access_token(
            identity=str(user['_id']),
            expires_delta=timedelta(days=30)
        )
        
        user_dict = User.to_dict(user)
        
        return jsonify({
            'message': 'Login successful',
            'token': access_token,
            'user': user_dict
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/me', methods=['GET'], endpoint='get_current_user')
@jwt_required()
def get_current_user():
    """Get current authenticated user."""
    try:
        user_id = get_jwt_identity()
        user = User.find_by_id(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        user_dict = User.to_dict(user)
        return jsonify({'user': user_dict}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

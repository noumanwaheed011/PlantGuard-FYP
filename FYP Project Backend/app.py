"""Main Flask application."""
import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_jwt_extended.exceptions import JWTDecodeError
from dotenv import load_dotenv
from config.database import get_db, close_db
from routes.auth import auth_bp
from routes.user import user_bp
from routes.analysis import analysis_bp
from routes.admin import admin_bp
from routes.feedback import feedback_bp

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__)

# Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'change-this-secret-key-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False  # We handle expiry in route
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Initialize extensions
# CORS configuration - allow all origins in development, restrict in production
CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000').split(',')
CORS(app, origins=CORS_ORIGINS, supports_credentials=True, allow_headers=['Content-Type', 'Authorization'])
jwt = JWTManager(app)

# JWT error handlers
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({'error': 'Token has expired'}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({'error': 'Invalid token'}), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({'error': 'Authorization token is missing'}), 401

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(user_bp)
app.register_blueprint(analysis_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(feedback_bp)


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    try:
        # Test MongoDB connection
        db = get_db()
        db.command('ping')
        return jsonify({
            'status': 'healthy',
            'database': 'connected',
            'message': 'PlantGuard AI Backend is running'
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'database': 'disconnected',
            'error': str(e)
        }), 500


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    return jsonify({'error': 'Internal server error'}), 500


@app.errorhandler(400)
def bad_request(error):
    """Handle 400 errors."""
    return jsonify({'error': 'Bad request'}), 400


@app.errorhandler(403)
def forbidden(error):
    """Handle 403 errors."""
    return jsonify({'error': 'Forbidden'}), 403


# Note: @app.before_first_request is deprecated in Flask 2.2+
# Database initialization happens in main block


if __name__ == '__main__':
    # Initialize database connection
    try:
        get_db()
        print("=" * 50)
        print("PlantGuard AI Backend Server")
        print("=" * 50)
        print("✓ MongoDB connected")
        print("✓ Database initialized")
        print("✓ Routes registered")
        print("=" * 50)
    except Exception as e:
        print(f"✗ Failed to initialize: {e}")
        print("Please ensure MongoDB is running and check your .env configuration")
        exit(1)
    
    # Get server configuration
    host = os.getenv('SERVER_HOST', '0.0.0.0')
    port = int(os.getenv('SERVER_PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', '1') == '1'
    
    print(f"\n🚀 Starting server on http://{host}:{port}")
    print(f"📧 Email OTP: {'Configured' if os.getenv('SMTP_USERNAME') else 'Not configured (check .env)'}")
    print("\nPress CTRL+C to stop\n")
    
    app.run(host=host, port=port, debug=debug)

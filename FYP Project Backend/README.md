# PlantGuard AI Backend

Flask-based REST API backend for PlantGuard AI plant disease detection application.

## Features

- ✅ MongoDB integration with auto-connection and collection creation
- ✅ JWT authentication
- ✅ Email-based OTP verification (SMTP)
- ✅ User registration and login
- ✅ Protected routes for user dashboard
- ✅ Password hashing (bcrypt)
- ✅ Image upload and analysis
- ✅ Admin dashboard endpoints

## Prerequisites

- Python 3.8+
- MongoDB (running locally or remote)
- Email account for SMTP (Gmail recommended)

## Installation

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set:
   - `MONGODB_URI`: MongoDB connection string (default: `mongodb://localhost:27017/`)
   - `MONGODB_DB_NAME`: Database name (default: `plantguard_db`)
   - `JWT_SECRET_KEY`: Strong random secret key
   - `SMTP_USERNAME`: Your email address
   - `SMTP_PASSWORD`: Your email app password (for Gmail, use App Password)
   - `EMAIL_FROM`: Sender email address
   - `EMAIL_FROM_NAME`: Sender name

3. **Start MongoDB:**
   - Ensure MongoDB is running on your system
   - Default connection: `mongodb://localhost:27017/`

4. **Run the backend:**
   ```bash
   python app.py
   ```

   Or:
   ```bash
   flask run
   ```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user (sends OTP)
- `POST /api/auth/verify-otp` - Verify OTP and create account
- `POST /api/auth/resend-otp` - Resend OTP
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)

### User Profile
- `GET /api/user/profile` - Get user profile (protected)
- `PUT /api/user/profile` - Update profile (protected)
- `PUT /api/user/password` - Change password (protected)
- `GET /api/user/analyses` - Get past analyses (protected)

### Analysis
- `POST /api/analysis/upload` - Upload plant image (protected)
- `POST /api/analysis/analyze` - Analyze image (protected)

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/detections` - Get all detections (admin only)
- `GET /api/admin/stats` - Get statistics (admin only)

### Health
- `GET /api/health` - Health check

## Database Collections

- `users` - User accounts
- `pending_users` - Temporary user data before OTP verification
- `otp_verifications` - OTP codes with expiry
- `analyses` - User analysis records
- `detections` - All detections (for admin)

## Email Configuration (Gmail)

1. Enable 2-Step Verification on your Google Account
2. Generate an App Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the generated password in `.env` as `SMTP_PASSWORD`

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Unique email validation
- OTP expiry (5 minutes)
- Protected routes with JWT
- Input validation
- Secure file uploads

## Project Structure

```
backend/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── .env.example          # Environment variables template
├── config/
│   ├── database.py       # MongoDB configuration
│   └── email.py          # Email configuration
├── models/
│   ├── user.py           # User model
│   ├── pending_user.py   # Pending user model
│   ├── otp.py            # OTP model
│   └── analysis.py       # Analysis model
├── routes/
│   ├── auth.py           # Authentication routes
│   ├── user.py           # User routes
│   ├── analysis.py       # Analysis routes
│   └── admin.py          # Admin routes
└── utils/
    ├── password.py       # Password utilities
    └── otp.py            # OTP utilities
```

## Development

- Backend runs on `http://localhost:5000`
- Frontend should connect to `http://localhost:5000/api`
- CORS is enabled for `http://localhost:5173` and `http://localhost:3000`

## Notes

- MongoDB collections and indexes are created automatically on first run
- OTP codes expire after 5 minutes
- Pending users expire after 1 hour
- JWT tokens expire after 30 days
- Image uploads are stored in `uploads/` directory

# Backend Setup Guide

## Quick Start

1. **Install MongoDB**
   - Download from https://www.mongodb.com/try/download/community
   - Install and start MongoDB service
   - Verify it's running: MongoDB Compass should connect to `mongodb://localhost:27017`

2. **Configure Email (Gmail)**
   - Enable 2-Step Verification on your Google Account
   - Go to: Google Account → Security → 2-Step Verification → App passwords
   - Generate an App Password for "Mail"
   - Copy the generated password

3. **Setup Backend**
   ```bash
   cd "FYP Project Backend"
   
   # Windows
   start_backend.bat
   
   # Linux/Mac
   chmod +x start_backend.sh
   ./start_backend.sh
   ```

4. **Configure .env**
   Edit `.env` file:
   ```
   MONGODB_URI=mongodb://localhost:27017/
   MONGODB_DB_NAME=plantguard_db
   JWT_SECRET_KEY=your-super-secret-key-change-this
   SMTP_USERNAME=your-email@gmail.com
   SMTP_PASSWORD=your-app-password-from-step-2
   EMAIL_FROM=your-email@gmail.com
   EMAIL_FROM_NAME=PlantGuard AI
   ```

5. **Start Backend**
   ```bash
   python app.py
   ```

6. **Verify**
   - Backend should start on http://localhost:5000
   - Check MongoDB Compass: database `plantguard_db` should appear
   - Test: http://localhost:5000/api/health

## Manual Setup

If automatic setup doesn't work:

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy .env.example to .env and configure
cp .env.example .env

# Run
python app.py
```

## Troubleshooting

### MongoDB Connection Failed
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Try: `mongodb://127.0.0.1:27017/` instead of `localhost`

### Email Not Sending
- Check SMTP credentials in `.env`
- For Gmail: Use App Password, not regular password
- Check firewall/antivirus blocking SMTP
- OTP will print to console in development mode if email fails

### Port Already in Use
- Change `SERVER_PORT` in `.env` to another port (e.g., 5001)
- Update frontend `.env`: `VITE_API_BASE_URL=http://localhost:5001/api`

## Database Collections

After first run, MongoDB Compass will show:
- `users` - User accounts
- `pending_users` - Temporary signup data
- `otp_verifications` - OTP codes
- `analyses` - User analyses
- `detections` - All detections (admin)

## Testing

Test endpoints:
- Health: `GET http://localhost:5000/api/health`
- Signup: `POST http://localhost:5000/api/auth/signup`
- Login: `POST http://localhost:5000/api/auth/login`

Use Postman or curl to test.

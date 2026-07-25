# Step-by-Step Setup Guide - PlantGuard AI

**Complete guide to run the full project from scratch**

---

## 📋 Prerequisites Checklist

Before starting, ensure you have installed:
- ✅ **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- ✅ **Python** (v3.8 or higher) - [Download](https://www.python.org/)
- ✅ **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- ✅ **Git** (optional, for cloning)

**Verify installations:**
```bash
node --version    # Should show v16.x or higher
python --version  # Should show Python 3.8.x or higher
mongod --version  # Should show MongoDB version
```

---

## 🗂️ Step 1: Project Structure

Ensure your project structure looks like this:
```
FYP/
├── FYP Project Backend/
│   ├── app.py
│   ├── .env.example
│   ├── requirements.txt
│   └── ...
└── FYP Project Frontend/
    ├── src/
    ├── package.json
    ├── .env
    └── ...
```

---

## 🍃 Step 2: Start MongoDB Server

### Option A: MongoDB as Windows Service (Recommended for Windows)

1. **Check if MongoDB service is running:**
   - Press `Win + R`, type `services.msc`, press Enter
   - Look for "MongoDB Server" service
   - If it exists and is running → ✅ MongoDB is ready
   - If it exists but stopped → Right-click → Start
   - If it doesn't exist → Use Option B

### Option B: Start MongoDB Manually

**Windows:**
```bash
# Open Command Prompt or PowerShell
# Navigate to MongoDB bin directory (usually):
cd C:\Program Files\MongoDB\Server\6.0\bin

# Start MongoDB server
mongod --dbpath "C:\data\db"
```

**Note:** If `C:\data\db` doesn't exist, create it first:
```bash
mkdir C:\data\db
```

**Linux/Mac:**
```bash
# Start MongoDB service
sudo systemctl start mongod
# OR
mongod --dbpath /usr/local/var/mongodb
```

### Verify MongoDB is Running:

**Open a NEW terminal window** and run:
```bash
# Test MongoDB connection
mongosh
# OR (older versions)
mongo
```

If you see `>` prompt, MongoDB is running! Type `exit` to quit.

**Alternative verification:**
```bash
# Check MongoDB port (should show process on port 27017)
netstat -an | findstr 27017
```

**✅ MongoDB Status:** Keep this terminal window open or minimize it. MongoDB must stay running.

---

## 🔧 Step 3: Backend Setup

### 3.1 Navigate to Backend Directory

**Open a NEW terminal window** (keep MongoDB terminal running):

```bash
cd "C:\Users\ISHRAQ KHAN\Downloads\FYP\FYP Project Backend"
```

### 3.2 Create .env File

**Windows (Command Prompt):**
```bash
copy .env.example .env
```

**Windows (PowerShell):**
```bash
Copy-Item .env.example .env
```

**Linux/Mac:**
```bash
cp .env.example .env
```

### 3.3 Edit .env File

Open `.env` file in a text editor and configure:

```env
# Flask Configuration
FLASK_APP=app.py
FLASK_ENV=development
FLASK_DEBUG=1

# JWT Secret Key (CHANGE THIS - use a random string)
JWT_SECRET_KEY=plantguard-secret-key-2024-change-in-production

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DB_NAME=plantguard_db

# Email Configuration (OPTIONAL - for OTP emails)
# If not configured, OTP will be printed in console
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=PlantGuard AI

# Server Configuration
SERVER_HOST=0.0.0.0
SERVER_PORT=5000

# CORS Origins (optional - defaults work for development)
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Important Notes:**
- ✅ **MONGODB_URI**: Keep as `mongodb://localhost:27017/` if MongoDB is running locally
- ✅ **JWT_SECRET_KEY**: Can use any string for development (change in production)
- ⚠️ **Email (Optional)**: If you don't configure email, OTP codes will appear in the backend console

### 3.4 Install Python Dependencies

In the same terminal window (backend directory):

```bash
# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**If you see errors:**
- Make sure Python is installed: `python --version`
- Try `pip3` instead of `pip`
- On Linux/Mac, you might need `pip3 install -r requirements.txt`

### 3.5 Start Backend Server

**In the same terminal window:**

```bash
python app.py
```

**Expected Output:**
```
==================================================
PlantGuard AI Backend Server
==================================================
✓ MongoDB connected
✓ Database initialized
✓ Routes registered
==================================================

🚀 Starting server on http://0.0.0.0:5000
📧 Email OTP: Not configured (check .env)
Press CTRL+C to stop
```

**✅ Backend Status:** 
- Server running on `http://localhost:5000`
- Keep this terminal window open
- You should see: `* Running on http://127.0.0.1:5000`

### 3.6 Verify Backend is Running

**Open a NEW browser tab** and visit:
```
http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "message": "PlantGuard AI Backend is running"
}
```

**✅ Backend Verified!** Keep backend terminal running.

---

## ⚛️ Step 4: Frontend Setup

### 4.1 Navigate to Frontend Directory

**Open a NEW terminal window** (keep MongoDB and Backend terminals running):

```bash
cd "C:\Users\ISHRAQ KHAN\Downloads\FYP\FYP Project Frontend"
```

### 4.2 Verify .env File

Check if `.env` file exists. If not, create it:

```bash
# Create .env file
echo VITE_API_BASE_URL=http://localhost:5000/api > .env
```

**Or manually create `.env` file with:**
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 4.3 Install Node Dependencies

**In the same terminal window:**

```bash
npm install
```

**This may take 2-5 minutes.** Wait for completion.

**If you see errors:**
- Make sure Node.js is installed: `node --version`
- Try deleting `node_modules` folder and `package-lock.json`, then run `npm install` again
- On some systems, use `npm install --legacy-peer-deps`

### 4.4 Start Frontend Development Server

**In the same terminal window:**

```bash
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**✅ Frontend Status:**
- Frontend running on `http://localhost:5173`
- Keep this terminal window open
- Browser should auto-open (if not, manually open `http://localhost:5173`)

### 4.5 Verify Frontend is Running

**Open browser** and visit:
```
http://localhost:5173
```

**You should see:** PlantGuard AI homepage

**✅ Frontend Verified!**

---

## 📧 Step 5: Understanding OTP Delivery

### How OTP Works:

1. **If Email is Configured:**
   - OTP code sent to user's email address
   - Check inbox (and spam folder)
   - Code expires in 5 minutes

2. **If Email is NOT Configured (Default):**
   - OTP code printed in **Backend terminal console**
   - Look for line like: `[DEV] OTP for user@example.com: 123456`
   - Code expires in 5 minutes

### Where to Find OTP:

**Backend Terminal Window** - Look for output like:
```
[DEV] OTP for user@example.com: 123456
```

**Or if email configured:**
```
✓ OTP email sent to user@example.com
```

---

## 🧪 Step 6: Test Complete Flow

### Test 1: Signup Flow

1. **Open browser:** `http://localhost:5173`
2. **Click:** "Get Started Free" or navigate to `/signup`
3. **Fill form:**
   - Full Name: `Test User`
   - Email: `test@example.com` (use a unique email)
   - Password: `Test1234` (must be 8+ chars, 1 letter, 1 number)
   - Confirm Password: `Test1234`
   - Check "I agree to terms"
4. **Click:** "Create Account"
5. **Expected:** Redirected to OTP verification page

### Test 2: OTP Verification

1. **Check Backend Terminal** for OTP code:
   ```
   [DEV] OTP for test@example.com: 123456
   ```
2. **Enter OTP** in the 6-digit input fields
3. **Click:** "Verify OTP"
4. **Expected:** 
   - "Verified Successfully" message
   - Auto-redirect to Account page
   - You are now logged in

### Test 3: Login Flow

1. **Logout** (if logged in) - Click logout button
2. **Navigate to:** `/login`
3. **Enter credentials:**
   - Email: `test@example.com`
   - Password: `Test1234`
4. **Click:** "Sign In"
5. **Expected:**
   - Login successful
   - Redirected to Account page
   - Profile data displayed

### Test 4: Upload & Analyze

1. **Navigate to:** `/upload` (or Account → Analyze Plant tab)
2. **Upload image:** Drag & drop or click to select a plant image
3. **Click:** "Analyze Disease"
4. **Expected:**
   - Progress bar shows analysis
   - Redirected to Results page
   - Disease detection results displayed

### Test 5: View Past Analyses

1. **Navigate to:** `/account`
2. **Click:** "Past Analyses" tab
3. **Expected:**
   - List of all your analyses
   - Download PDF button available

---

## 🔍 Step 7: Verification Checklist

### ✅ All Services Running:

| Service | Terminal Window | Status | URL |
|---------|----------------|--------|-----|
| MongoDB | Terminal 1 | ✅ Running | `mongodb://localhost:27017` |
| Backend | Terminal 2 | ✅ Running | `http://localhost:5000` |
| Frontend | Terminal 3 | ✅ Running | `http://localhost:5173` |

### ✅ Quick Health Checks:

**1. MongoDB:**
```bash
mongosh
# Should connect successfully
exit
```

**2. Backend:**
```bash
# In browser or new terminal:
curl http://localhost:5000/api/health
# Should return: {"status":"healthy","database":"connected"}
```

**3. Frontend:**
```bash
# Open browser:
http://localhost:5173
# Should show homepage
```

---

## 🐛 Troubleshooting

### Problem: MongoDB won't start

**Solution:**
- Check if port 27017 is in use: `netstat -an | findstr 27017`
- Create data directory: `mkdir C:\data\db`
- Check MongoDB service: `services.msc`
- Try: `mongod --dbpath "C:\data\db" --port 27017`

### Problem: Backend can't connect to MongoDB

**Solution:**
- Verify MongoDB is running (check Terminal 1)
- Check `.env` file has: `MONGODB_URI=mongodb://localhost:27017/`
- Try: `mongosh` to test MongoDB connection
- Restart MongoDB service

### Problem: Backend port 5000 already in use

**Solution:**
- Find process using port: `netstat -ano | findstr :5000`
- Kill process or change port in `.env`: `SERVER_PORT=5001`
- Update frontend `.env`: `VITE_API_BASE_URL=http://localhost:5001/api`

### Problem: Frontend can't connect to backend

**Solution:**
- Verify backend is running (check Terminal 2)
- Check frontend `.env`: `VITE_API_BASE_URL=http://localhost:5000/api`
- Check browser console for CORS errors
- Verify backend CORS configuration in `app.py`

### Problem: OTP not received

**Solution:**
- **Check Backend Terminal** - OTP is printed there if email not configured
- Look for: `[DEV] OTP for email@example.com: 123456`
- If email configured, check spam folder
- Verify email credentials in backend `.env`

### Problem: npm install fails

**Solution:**
- Clear cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`
- Try: `npm install --legacy-peer-deps`
- Check Node.js version: `node --version` (should be v16+)

### Problem: Python dependencies fail

**Solution:**
- Use Python 3.8+: `python --version`
- Try: `pip3 install -r requirements.txt`
- Use virtual environment: `python -m venv venv`
- On Windows, might need: `python -m pip install -r requirements.txt`

---

## 📝 Summary: Terminal Windows

You need **3 terminal windows** running simultaneously:

### Terminal 1: MongoDB
```bash
mongod --dbpath "C:\data\db"
# OR MongoDB service running
```
**Status:** MongoDB server running

### Terminal 2: Backend
```bash
cd "FYP Project Backend"
python app.py
```
**Status:** Flask server running on port 5000

### Terminal 3: Frontend
```bash
cd "FYP Project Frontend"
npm run dev
```
**Status:** React dev server running on port 5173

---

## 🎯 Quick Start Commands (Copy-Paste)

### Windows (PowerShell):

**Terminal 1 - MongoDB:**
```powershell
mongod --dbpath "C:\data\db"
```

**Terminal 2 - Backend:**
```powershell
cd "C:\Users\ISHRAQ KHAN\Downloads\FYP\FYP Project Backend"
python app.py
```

**Terminal 3 - Frontend:**
```powershell
cd "C:\Users\ISHRAQ KHAN\Downloads\FYP\FYP Project Frontend"
npm run dev
```

### Linux/Mac:

**Terminal 1 - MongoDB:**
```bash
sudo systemctl start mongod
# OR
mongod --dbpath /usr/local/var/mongodb
```

**Terminal 2 - Backend:**
```bash
cd "FYP Project Backend"
python3 app.py
```

**Terminal 3 - Frontend:**
```bash
cd "FYP Project Frontend"
npm run dev
```

---

## ✅ Final Checklist

Before testing, ensure:

- [ ] MongoDB is running (Terminal 1)
- [ ] Backend is running (Terminal 2) - shows "Running on http://127.0.0.1:5000"
- [ ] Frontend is running (Terminal 3) - shows "Local: http://localhost:5173"
- [ ] Backend `.env` file exists and configured
- [ ] Frontend `.env` file exists with API URL
- [ ] Health check works: `http://localhost:5000/api/health`
- [ ] Homepage loads: `http://localhost:5173`

**🎉 You're ready to test!**

---

## 📞 Need Help?

1. **Check terminal outputs** - errors usually appear there
2. **Verify all 3 services** are running
3. **Check `.env` files** are configured correctly
4. **Review troubleshooting section** above
5. **Check browser console** (F12) for frontend errors
6. **Check backend terminal** for server errors

---

**Last Updated:** February 11, 2026  
**Project:** PlantGuard AI - Full Stack Application

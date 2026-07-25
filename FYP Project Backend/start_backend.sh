#!/bin/bash

echo "========================================"
echo "PlantGuard AI Backend Startup"
echo "========================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    exit 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo ""
    echo "IMPORTANT: Please edit .env and configure:"
    echo "  - MONGODB_URI"
    echo "  - JWT_SECRET_KEY"
    echo "  - SMTP_USERNAME and SMTP_PASSWORD"
    echo ""
    read -p "Press Enter to continue..."
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

echo ""
echo "========================================"
echo "Starting Flask backend server..."
echo "========================================"
echo ""

python3 app.py

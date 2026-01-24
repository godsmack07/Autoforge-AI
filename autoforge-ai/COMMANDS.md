# 🚀 AutoForge AI - Complete Commands Reference

## Quick Start Commands

### Option 1: Using Startup Scripts (Recommended)

#### Windows
```bash
# Double-click or run in terminal
start-all.bat
```

#### macOS/Linux
```bash
# Make executable (first time only)
chmod +x start-all.sh

# Run the script
./start-all.sh
```

### Option 2: Using NPM Concurrently

```bash
# Install concurrently (first time only)
npm install

# Start all services at once
npm start
```

### Option 3: Manual Start (3 Terminals Required)

#### Terminal 1 - Backend
```bash
cd backend
npm start
```

#### Terminal 2 - ML Engine
```bash
cd ml-engine
python app.py
```

#### Terminal 3 - Frontend
```bash
cd frontend
npm start
```

---

## Installation Commands

### First Time Setup

#### Automated Setup (Recommended)
```bash
python setup.py
```

#### Manual Installation

**1. Install Backend Dependencies**
```bash
cd backend
npm install
```

**2. Install Frontend Dependencies**
```bash
cd frontend
npm install
```

**3. Install ML Engine Dependencies**
```bash
cd ml-engine
pip install -r requirements.txt
```

**4. Install Root Dependencies (for concurrently)**
```bash
# In project root
npm install
```

---

## Development Commands

### Backend Development

```bash
cd backend

# Start with auto-reload (nodemon)
npm run dev

# Start normally
npm start

# Check health
curl http://localhost:5000/api/health
```

### Frontend Development

```bash
cd frontend

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

### ML Engine Development

```bash
cd ml-engine

# Start Flask server
python app.py

# Start with auto-reload
FLASK_ENV=development python app.py

# Check health
curl http://localhost:5001/api/ml/health
```

---

## Testing Commands

### Backend Tests
```bash
cd backend

# Run integration tests
node test-integration.js

# Test specific endpoint
curl -X GET http://localhost:5000/api/health
```

### ML Engine Tests
```bash
cd ml-engine

# Run all tests
pytest

# Run specific test file
pytest test_ml_engine.py

# Run with verbose output
pytest -v

# Run with coverage
pytest --cov=.
```

### Frontend Tests
```bash
cd frontend

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

---

## Build Commands

### Production Build

```bash
# Build frontend
cd frontend
npm run build

# The build folder will be created in frontend/build/
```

### Start Production Server

```bash
# Set environment to production
cd backend
set NODE_ENV=production  # Windows
export NODE_ENV=production  # Unix/Mac

npm start
```

---

## Utility Commands

### Check Service Status

```bash
# Check if ports are in use
netstat -ano | findstr :3000  # Windows
netstat -ano | findstr :5000
netstat -ano | findstr :5001

lsof -i :3000  # Unix/Mac
lsof -i :5000
lsof -i :5001
```

### Kill Processes on Ports

```bash
# Windows
taskkill /PID <PID> /F

# Unix/Mac
kill -9 <PID>
```

### Clear Node Modules (if issues occur)

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json  # Unix/Mac
rmdir /s node_modules & del package-lock.json  # Windows
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json  # Unix/Mac
rmdir /s node_modules & del package-lock.json  # Windows
npm install
```

### Clear Python Cache

```bash
cd ml-engine

# Unix/Mac
find . -type d -name __pycache__ -exec rm -r {} +
find . -type f -name "*.pyc" -delete

# Windows
for /d /r . %d in (__pycache__) do @if exist "%d" rd /s /q "%d"
del /s /q *.pyc
```

---

## Environment Setup Commands

### Create Environment Files

```bash
# Backend
cd backend
cp .env.example .env

# ML Engine
cd ml-engine
cp .env.example .env
```

### Edit Environment Variables

```bash
# Windows
notepad backend\.env
notepad ml-engine\.env

# Unix/Mac
nano backend/.env
nano ml-engine/.env
```

---

## Debugging Commands

### View Logs

```bash
# Backend logs
cd backend
type logs\app.log  # Windows
cat logs/app.log   # Unix/Mac

# ML Engine logs
cd ml-engine
type logs\ml_engine.log  # Windows
cat logs/ml_engine.log   # Unix/Mac
```

### Check Python Version

```bash
python --version
# Should be 3.8 or higher
```

### Check Node Version

```bash
node --version
# Should be 16.0 or higher

npm --version
```

### Check Installed Python Packages

```bash
cd ml-engine
pip list
pip show flask
pip show scikit-learn
```

### Check Installed Node Packages

```bash
cd backend
npm list

cd frontend
npm list
```

---

## API Testing Commands (using curl)

### Backend API

```bash
# Health check
curl http://localhost:5000/api/health

# Upload file
curl -X POST http://localhost:5000/api/upload \
  -F "files=@path/to/your/file.csv"

# Test prediction (example)
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"features":["age","income"],"values":[25,50000],"modelId":"model_123"}'
```

### ML Engine API

```bash
# Health check
curl http://localhost:5001/api/ml/health

# List available models
curl http://localhost:5001/api/ml/models
```

---

## Git Commands (for version control)

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit"

# Create .gitignore
echo "node_modules/" > .gitignore
echo "__pycache__/" >> .gitignore
echo "*.pyc" >> .gitignore
echo ".env" >> .gitignore
echo "uploads/" >> .gitignore
echo "models/" >> .gitignore
echo "logs/" >> .gitignore
```

---

## Troubleshooting Commands

### Problem: Port already in use

```bash
# Find process using port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Find process using port 5000 (Unix/Mac)
lsof -ti:5000
kill -9 $(lsof -ti:5000)
```

### Problem: Python module not found

```bash
cd ml-engine

# Reinstall all dependencies
pip install -r requirements.txt

# Install specific package
pip install flask
```

### Problem: npm install fails

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Problem: CORS errors

```bash
# Check backend CORS configuration
cd backend
cat .env | grep CORS  # Unix/Mac
type .env | findstr CORS  # Windows

# Ensure CORS_ORIGIN=http://localhost:3000
```

---

## Performance Optimization Commands

### Increase Node.js Memory Limit

```bash
# Backend with increased memory
cd backend
node --max-old-space-size=4096 server.js
```

### Run Frontend in Production Mode

```bash
cd frontend
npm run build
serve -s build -l 3000
```

---

## Database/Storage Commands

### View Uploaded Files

```bash
cd backend/uploads
ls -lh  # Unix/Mac
dir     # Windows
```

### View Trained Models

```bash
cd backend/models
ls -lh  # Unix/Mac
dir     # Windows
```

### Clear Uploads (be careful!)

```bash
cd backend
rm -rf uploads/*  # Unix/Mac
del /q uploads\*  # Windows
```

---

## Summary of All Services

| Service | Port | Start Command | Health Check |
|---------|------|---------------|--------------|
| Frontend | 3000 | `cd frontend && npm start` | http://localhost:3000 |
| Backend | 5000 | `cd backend && npm start` | http://localhost:5000/api/health |
| ML Engine | 5001 | `cd ml-engine && python app.py` | http://localhost:5001/api/ml/health |

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────┐
│           AutoForge AI - Quick Commands                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  START ALL:        start-all.bat (Windows)              │
│                    ./start-all.sh (Unix/Mac)            │
│                                                          │
│  INSTALL:          python setup.py                      │
│                                                          │
│  BACKEND:          cd backend && npm start              │
│  FRONTEND:         cd frontend && npm start             │
│  ML ENGINE:        cd ml-engine && python app.py        │
│                                                          │
│  HEALTH CHECKS:                                         │
│    Backend:        http://localhost:5000/api/health     │
│    ML Engine:      http://localhost:5001/api/ml/health  │
│    Frontend:       http://localhost:3000                │
│                                                          │
│  LOGS:             backend/logs/                        │
│                    ml-engine/logs/                      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

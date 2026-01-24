#!/bin/bash

echo "========================================"
echo "   AutoForge AI - Starting All Services"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "[ERROR] Python is not installed or not in PATH"
    echo "Please install Python from https://www.python.org/"
    exit 1
fi

# Determine Python command
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
else
    PYTHON_CMD="python"
fi

echo "[INFO] All prerequisites found!"
echo ""
echo "Starting services..."
echo ""

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Start Backend (Node.js)
echo "[1/3] Starting Backend API (Port 5000)..."
cd "$SCRIPT_DIR/backend"
gnome-terminal --title="AutoForge Backend" -- bash -c "npm start; exec bash" 2>/dev/null || \
xterm -T "AutoForge Backend" -e "npm start; bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd '"$SCRIPT_DIR/backend"' && npm start"' 2>/dev/null || \
(npm start &)

sleep 3

# Start ML Engine (Python)
echo "[2/3] Starting ML Engine (Port 5001)..."
cd "$SCRIPT_DIR/ml-engine"
gnome-terminal --title="AutoForge ML Engine" -- bash -c "$PYTHON_CMD app.py; exec bash" 2>/dev/null || \
xterm -T "AutoForge ML Engine" -e "$PYTHON_CMD app.py; bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd '"$SCRIPT_DIR/ml-engine"' && '"$PYTHON_CMD"' app.py"' 2>/dev/null || \
($PYTHON_CMD app.py &)

sleep 3

# Start Frontend (React)
echo "[3/3] Starting Frontend (Port 3000)..."
cd "$SCRIPT_DIR/frontend"
gnome-terminal --title="AutoForge Frontend" -- bash -c "npm start; exec bash" 2>/dev/null || \
xterm -T "AutoForge Frontend" -e "npm start; bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd '"$SCRIPT_DIR/frontend"' && npm start"' 2>/dev/null || \
(npm start &)

echo ""
echo "========================================"
echo "   All services started successfully!"
echo "========================================"
echo ""
echo "Services running:"
echo "  - Frontend:  http://localhost:3000"
echo "  - Backend:   http://localhost:5000"
echo "  - ML Engine: http://localhost:5001"
echo ""
echo "Press Ctrl+C to stop this script (services will continue running)"
echo ""

# Keep script running
wait

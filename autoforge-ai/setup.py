import os
import subprocess
import sys

def setup_project():
    """Setup AutoForge AI project"""
    print("🚀 Setting up AutoForge AI...")
    
    # Create directories
    directories = [
        'frontend/src/components',
        'backend/routes',
        'ml-engine',
        'sample-datasets',
        'uploads',
        'models',
        'logs'
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"📁 Created: {directory}")
    
    # Install dependencies
    print("\n📦 Installing dependencies...")
    
    # Frontend
    print("\n⚛️ Installing React dependencies...")
    subprocess.run(['npm', 'install'], cwd='frontend', shell=True)
    
    # Backend
    print("\n⬢ Installing Node.js dependencies...")
    subprocess.run(['npm', 'install'], cwd='backend', shell=True)
    
    # Python ML Engine
    print("\n🐍 Installing Python dependencies...")
    subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', 'ml-engine/requirements.txt'])
    
    print("\n✅ Setup complete!")
    print("\n🎯 To start AutoForge AI:")
    print("1. Terminal 1: cd backend && npm start")
    print("2. Terminal 2: cd frontend && npm start")
    print("3. Terminal 3: cd ml-engine && python app.py")
    print("\n🌐 Open: http://localhost:3000")

if __name__ == '__main__':
    setup_project()
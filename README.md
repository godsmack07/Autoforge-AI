# 🤖 AutoForge AI

**Build AI Models Without Code** - A complete no-code AutoML platform for data analysis, model training, and deployment.

![AutoForge AI](https://img.shields.io/badge/AutoML-Platform-blue)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)
![Python](https://img.shields.io/badge/Python-ML%20Engine-yellow?logo=python)

## ✨ Features

- 📊 **Data Upload & Analysis** - Upload CSV files or use sample datasets
- 🧹 **Automated Data Cleaning** - Remove missing values, duplicates, and outliers
- 🧠 **10+ ML Models** - Linear Regression, Random Forest, XGBoost, Neural Networks, and more
- 📈 **Real-time Visualization** - Interactive charts and model performance metrics
- 🧪 **Model Testing** - Comprehensive evaluation with MAE, RMSE, R² scores
- 🚀 **One-Click Deployment** - Deploy as REST API, Web App, or export model files
- 🌓 **Dark/Light Mode** - Beautiful glassmorphism UI with theme toggle

## 🏗️ Architecture

```
autoforge-ai/
├── frontend/          # React application (Port 3000)
├── backend/           # Node.js Express API (Port 5000)
├── ml-engine/         # Python ML services (Port 5001)
└── sample-datasets/   # Example datasets
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Python 3.8+
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/autoforge-ai.git
cd autoforge-ai
```

2. **Install dependencies**

Run the automated setup:
```bash
python setup.py
```

Or install manually:

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install

# ML Engine
cd ../ml-engine
pip install -r requirements.txt
```

### Running the Application

You need **3 terminals** running simultaneously:

**Terminal 1 - Backend API**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend**
```bash
cd frontend
npm start
```

**Terminal 3 - ML Engine**
```bash
cd ml-engine
python app.py
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **ML Engine**: http://localhost:5001

## 📖 Usage Guide

### 1. Upload Data
- Drag & drop CSV files or select from sample datasets
- View automatic data quality analysis
- Identify missing values and data issues

### 2. Clean Data
- Select cleaning options (remove missing, fill values, remove duplicates)
- Choose columns to include
- Specify row ranges for processing

### 3. Train Model
- Choose from 10+ regression models
- Configure train/validation/test split
- Select target and feature columns
- Monitor training progress in real-time

### 4. Test & Validate
- View comprehensive metrics (Accuracy, MAE, RMSE, R²)
- Interactive charts (Line, Scatter, Error distribution)
- Make live predictions with custom inputs

### 5. Deploy
- **REST API**: Get API endpoint and authentication key
- **Web App**: Embed widget in your website
- **Export**: Download model in .pkl, .onnx, .h5, or JSON format

## 🛠️ Tech Stack

### Frontend
- React 18.2
- Recharts for data visualization
- React Hot Toast for notifications
- PapaParse for CSV parsing
- React Dropzone for file uploads

### Backend
- Express.js
- Socket.IO for real-time updates
- Multer for file handling
- Helmet for security
- Express Rate Limit

### ML Engine
- Flask REST API
- scikit-learn for classical ML
- XGBoost, LightGBM, CatBoost for gradient boosting
- TensorFlow/Keras for neural networks
- SHAP & LIME for model explainability

## 📁 Project Structure

```
autoforge-ai/
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── UploadWizard.jsx
│   │   │   ├── DataCleaner.jsx
│   │   │   ├── ModelTrainer.jsx
│   │   │   ├── ModelTester.jsx
│   │   │   ├── ModelDeployer.jsx
│   │   │   ├── CSVViewer.jsx
│   │   │   ├── DataVisualizer.jsx
│   │   │   └── ThemeToggle.jsx
│   │   ├── App.jsx
│   │   └── index.js
│   └── package.json
├── backend/
│   ├── server.js            # Express API server
│   ├── uploads/             # Uploaded files
│   ├── models/              # Trained models
│   └── package.json
├── ml-engine/
│   ├── app.py               # Flask ML API
│   ├── data_loader.py
│   ├── data_cleaner.py
│   ├── model_trainer.py
│   ├── model_evaluator.py
│   ├── model_deployer.py
│   └── requirements.txt
└── setup.py                 # Automated setup script
```

## 🎯 API Endpoints

### Backend (Port 5000)
- `GET /api/health` - Health check
- `POST /api/upload` - Upload and analyze files
- `POST /api/clean` - Clean data
- `POST /api/train` - Train model
- `POST /api/test` - Test model
- `POST /api/predict` - Make predictions
- `POST /api/deploy` - Deploy model

### ML Engine (Port 5001)
- `GET /api/ml/health` - Health check
- `POST /api/ml/analyze` - Analyze CSV data
- `POST /api/ml/clean` - Clean data
- `POST /api/ml/train` - Train model
- `POST /api/ml/evaluate` - Evaluate model
- `POST /api/ml/predict` - Make predictions
- `POST /api/ml/deploy` - Deploy model
- `GET /api/ml/models` - List available models

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with React, Express, and Flask
- ML powered by scikit-learn, XGBoost, and TensorFlow
- UI inspired by modern glassmorphism design trends

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Made with ❤️ by AutoForge AI Team**

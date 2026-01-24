"""
AutoForge AI - Main ML Engine
Runs as a Flask API for ML operations
"""

import sys
import os
import json
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
import threading
from datetime import datetime
import traceback
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration from environment variables
FLASK_PORT = int(os.getenv('FLASK_PORT', 5001))
FLASK_ENV = os.getenv('FLASK_ENV', 'development')
FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
MODEL_STORAGE_PATH = os.getenv('MODEL_STORAGE_PATH', './models')
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')

# Setup logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import custom modules
from data_loader import DataLoader
from data_cleaner import DataCleaner
from model_regressors import RegressionModels
from model_trainer import ModelTrainer
from model_evaluator import ModelEvaluator
from model_deployer import ModelDeployer

app = Flask(__name__)
CORS(app)

# Initialize components
data_loader = DataLoader()
data_cleaner = DataCleaner()
regression_models = RegressionModels()
model_trainer = ModelTrainer()
model_evaluator = ModelEvaluator()
model_deployer = ModelDeployer()

# Store active training jobs
training_jobs = {}

@app.route('/api/ml/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'AutoForge ML Engine',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/ml/analyze', methods=['POST'])
def analyze_data():
    """Analyze uploaded CSV data"""
    try:
        if 'file' not in request.files:
            logger.warning('Analyze request received without file')
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        logger.info(f'Analyzing file: {file.filename}')
        analysis = data_loader.analyze_csv(file)
        
        return jsonify({
            'success': True,
            'analysis': analysis
        })
    
    except Exception as e:
        logger.error(f'Error analyzing data: {str(e)}', exc_info=True)
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Failed to analyze CSV file. Please check the file format.'
        }), 500

@app.route('/api/ml/clean', methods=['POST'])
def clean_data():
    """Clean data based on options"""
    try:
        data = request.json
        file_path = data.get('file_path')
        options = data.get('options', {})
        
        if not file_path:
            logger.warning('Clean request received without file_path')
            return jsonify({'error': 'file_path is required'}), 400
        
        logger.info(f'Cleaning data from: {file_path}')
        cleaned_data = data_cleaner.clean_data(file_path, options)
        
        return jsonify({
            'success': True,
            'cleaned_data': cleaned_data
        })
    
    except Exception as e:
        logger.error(f'Error cleaning data: {str(e)}', exc_info=True)
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Failed to clean data. Please check the file path and options.'
        }), 500

@app.route('/api/ml/train', methods=['POST'])
def train_model():
    """Train a regression model"""
    try:
        data = request.json
        job_id = f"job_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Start training in background thread
        def train_async():
            try:
                result = model_trainer.train(
                    data_path=data.get('data_path'),
                    model_type=data.get('model_type', 'random_forest'),
                    target_column=data.get('target_column'),
                    feature_columns=data.get('feature_columns', []),
                    split_ratios=data.get('split_ratios', {'train': 70, 'val': 15, 'test': 15})
                )
                training_jobs[job_id] = {
                    'status': 'completed',
                    'result': result,
                    'completed_at': datetime.now().isoformat()
                }
            except Exception as e:
                training_jobs[job_id] = {
                    'status': 'failed',
                    'error': str(e),
                    'failed_at': datetime.now().isoformat()
                }
        
        thread = threading.Thread(target=train_async)
        thread.start()
        
        training_jobs[job_id] = {
            'status': 'started',
            'started_at': datetime.now().isoformat(),
            'model_type': data.get('model_type')
        }
        
        return jsonify({
            'success': True,
            'job_id': job_id,
            'message': 'Training started in background'
        })
    
    except Exception as e:
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@app.route('/api/ml/train/status/<job_id>', methods=['GET'])
def training_status(job_id):
    """Check training job status"""
    job = training_jobs.get(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    
    return jsonify({
        'job_id': job_id,
        'status': job['status'],
        'data': job
    })

@app.route('/api/ml/evaluate', methods=['POST'])
def evaluate_model():
    """Evaluate trained model"""
    try:
        data = request.json
        model_path = data.get('model_path')
        test_data_path = data.get('test_data_path')
        
        evaluation = model_evaluator.evaluate(model_path, test_data_path)
        
        return jsonify({
            'success': True,
            'evaluation': evaluation
        })
    
    except Exception as e:
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@app.route('/api/ml/predict', methods=['POST'])
def predict():
    """Make predictions with trained model"""
    try:
        data = request.json
        model_path = data.get('model_path')
        features = data.get('features', [])
        
        prediction = model_evaluator.predict(model_path, features)
        
        return jsonify({
            'success': True,
            'prediction': prediction
        })
    
    except Exception as e:
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@app.route('/api/ml/deploy', methods=['POST'])
def deploy_model():
    """Deploy model as API"""
    try:
        data = request.json
        model_path = data.get('model_path')
        model_type = data.get('model_type')
        deployment_type = data.get('deployment_type', 'api')
        
        deployment = model_deployer.deploy(
            model_path=model_path,
            model_type=model_type,
            deployment_type=deployment_type
        )
        
        return jsonify({
            'success': True,
            'deployment': deployment
        })
    
    except Exception as e:
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@app.route('/api/ml/models', methods=['GET'])
def list_models():
    """List available regression models"""
    models = regression_models.get_available_models()
    
    return jsonify({
        'success': True,
        'models': models
    })

if __name__ == '__main__':
    logger.info("🚀 Starting AutoForge ML Engine...")
    logger.info(f"📊 API running on http://localhost:{FLASK_PORT}")
    logger.info(f"🔧 Environment: {FLASK_ENV}")
    logger.info(f"📁 Model Storage: {MODEL_STORAGE_PATH}")
    print("🚀 Starting AutoForge ML Engine...")
    print(f"📊 API running on http://localhost:{FLASK_PORT}")
    print("🔗 Endpoints:")
    print("  • GET  /api/ml/health     - Health check")
    print("  • POST /api/ml/analyze    - Analyze CSV data")
    print("  • POST /api/ml/clean      - Clean data")
    print("  • POST /api/ml/train      - Train model")
    print("  • POST /api/ml/evaluate   - Evaluate model")
    print("  • POST /api/ml/predict    - Make predictions")
    print("  • POST /api/ml/deploy     - Deploy model")
    print("  • GET  /api/ml/models     - List available models")
    app.run(host='0.0.0.0', port=FLASK_PORT, debug=FLASK_DEBUG)
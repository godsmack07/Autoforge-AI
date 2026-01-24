# AutoForge AI - Integration Guide

## Architecture Overview

AutoForge AI is a full-stack AutoML platform consisting of three integrated services:

```
┌─────────────────────────────────────────────────────────────┐
│                    User Browser                              │
│                  http://localhost:3000                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP/WebSocket
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Node.js Backend (Express)                       │
│                  Port 5000                                   │
│  • File Upload & Management                                  │
│  • API Gateway                                               │
│  • Socket.IO for Real-time Updates                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP/Process Spawn
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Python ML Engine (Flask)                        │
│                  Port 5001                                   │
│  • Data Analysis & Cleaning                                  │
│  • Model Training (10+ algorithms)                          │
│  • Model Evaluation & Deployment                            │
└─────────────────────────────────────────────────────────────┘
```

## Component Communication

### 1. Frontend → Backend

**Technology**: Axios HTTP requests + Socket.IO WebSocket

**Endpoints Used**:
- `POST /api/upload` - Upload CSV files
- `POST /api/clean` - Clean data
- `POST /api/train` - Train model
- `POST /api/test` - Test model
- `POST /api/predict` - Make predictions
- `POST /api/deploy` - Deploy model
- `GET /api/health` - Health check

**Example**:
```javascript
// Frontend component making API call
const response = await axios.post('/api/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

### 2. Backend → ML Engine

**Technology**: Python process spawning + HTTP requests

**Methods**:
1. **Process Spawning** (Current): Backend spawns Python scripts directly
2. **HTTP Requests** (Alternative): Backend makes HTTP calls to Flask API

**Example (Process Spawn)**:
```javascript
// Backend spawning Python process
const pythonProcess = spawn('python', [
  path.join(__dirname, '../ml-engine/data_cleaner.py'),
  JSON.stringify({ files, options })
]);
```

**Example (HTTP Request)**:
```javascript
// Alternative: HTTP request to ML Engine
const response = await axios.post('http://localhost:5001/api/ml/clean', {
  file_path: filePath,
  options: cleaningOptions
});
```

### 3. Real-time Updates

**Technology**: Socket.IO

**Events**:
- `training_start` - Client initiates training
- `training_status` - Server sends progress updates
- `training_complete` - Training finished
- `training_error` - Training failed

**Example**:
```javascript
// Frontend listening for updates
socket.on('training_status', (data) => {
  console.log('Training progress:', data.progress);
});
```

## Data Flow

### Complete ML Pipeline Flow

```
1. User uploads CSV
   ↓
2. Frontend → Backend (/api/upload)
   ↓
3. Backend saves file to ./uploads/
   ↓
4. Backend analyzes CSV (basic stats)
   ↓
5. Backend → Frontend (analysis results)
   ↓
6. User selects cleaning options
   ↓
7. Frontend → Backend (/api/clean)
   ↓
8. Backend → ML Engine (spawn data_cleaner.py)
   ↓
9. ML Engine processes data
   ↓
10. ML Engine → Backend (cleaned data)
    ↓
11. Backend → Frontend (cleaned data)
    ↓
12. User selects model & parameters
    ↓
13. Frontend → Backend (/api/train)
    ↓
14. Backend → ML Engine (spawn model_trainer.py)
    ↓
15. ML Engine trains model
    ↓
16. ML Engine saves model to ./models/
    ↓
17. ML Engine → Backend (model metrics)
    ↓
18. Backend → Frontend (training results)
    ↓
19. User tests model
    ↓
20. Frontend → Backend (/api/test)
    ↓
21. Backend → ML Engine (evaluate model)
    ↓
22. ML Engine → Frontend (test results)
    ↓
23. User deploys model
    ↓
24. Backend generates API key & endpoint
    ↓
25. Frontend displays deployment info
```

## File Structure

```
autoforge-ai/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── App.jsx          # Main app component
│   │   ├── App.css          # Main styles
│   │   └── index.js         # Entry point
│   ├── public/
│   └── package.json
│
├── backend/                  # Node.js Express API
│   ├── server.js            # Main server file
│   ├── uploads/             # Uploaded files storage
│   ├── models/              # Trained models storage
│   ├── logs/                # Application logs
│   ├── temp/                # Temporary files
│   ├── .env.example         # Environment template
│   └── package.json
│
├── ml-engine/               # Python ML services
│   ├── app.py               # Flask API server
│   ├── data_loader.py       # Data loading utilities
│   ├── data_cleaner.py      # Data cleaning functions
│   ├── model_trainer.py     # Model training logic
│   ├── model_evaluator.py   # Model evaluation
│   ├── model_deployer.py    # Model deployment
│   ├── model_regressors.py  # ML model definitions
│   ├── .env.example         # Environment template
│   └── requirements.txt
│
├── start-all.bat            # Windows startup script
├── start-all.sh             # Unix/Mac startup script
├── package.json             # Root package.json
└── README.md
```

## API Endpoint Reference

### Backend API (Port 5000)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/health` | Health check | - | `{ status, service, version }` |
| POST | `/api/upload` | Upload files | `FormData` | `{ success, files, analysis }` |
| POST | `/api/clean` | Clean data | `{ options, files }` | `{ success, data, stats }` |
| POST | `/api/train` | Train model | `{ modelType, splitRatios, ... }` | `{ success, model }` |
| POST | `/api/test` | Test model | `{ modelId, testData }` | `{ success, results }` |
| POST | `/api/predict` | Predict | `{ features, values, modelId }` | `{ success, prediction }` |
| POST | `/api/deploy` | Deploy model | `{ modelId, deploymentType }` | `{ success, deployment }` |

### ML Engine API (Port 5001)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/ml/health` | Health check | - | `{ status, service, version }` |
| POST | `/api/ml/analyze` | Analyze CSV | `FormData` | `{ success, analysis }` |
| POST | `/api/ml/clean` | Clean data | `{ file_path, options }` | `{ success, cleaned_data }` |
| POST | `/api/ml/train` | Train model | `{ data_path, model_type, ... }` | `{ success, job_id }` |
| GET | `/api/ml/train/status/:id` | Training status | - | `{ job_id, status, data }` |
| POST | `/api/ml/evaluate` | Evaluate model | `{ model_path, test_data_path }` | `{ success, evaluation }` |
| POST | `/api/ml/predict` | Make prediction | `{ model_path, features }` | `{ success, prediction }` |
| POST | `/api/ml/deploy` | Deploy model | `{ model_path, deployment_type }` | `{ success, deployment }` |
| GET | `/api/ml/models` | List models | - | `{ success, models }` |

## Error Handling Patterns

### Frontend Error Handling
```javascript
try {
  const response = await axios.post('/api/train', data);
  toast.success('Training started!');
} catch (error) {
  if (error.response) {
    // Server responded with error
    toast.error(error.response.data.error);
  } else if (error.request) {
    // No response received
    toast.error('Server not responding. Please check if backend is running.');
  } else {
    // Request setup error
    toast.error('Request failed: ' + error.message);
  }
}
```

### Backend Error Handling
```javascript
app.post('/api/train', async (req, res) => {
  try {
    // Process request
    res.json({ success: true, model: result });
  } catch (error) {
    console.error('Training error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});
```

### ML Engine Error Handling
```python
@app.route('/api/ml/train', methods=['POST'])
def train_model():
    try:
        # Train model
        return jsonify({'success': True, 'job_id': job_id})
    except Exception as e:
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500
```

## Environment Variables

### Backend (.env)
```
PORT=5000
ML_ENGINE_URL=http://localhost:5001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
MAX_FILE_SIZE=104857600
```

### ML Engine (.env)
```
FLASK_PORT=5001
FLASK_ENV=development
MODEL_STORAGE_PATH=./models
LOG_LEVEL=INFO
```

## Troubleshooting

### Common Issues

**Issue**: Port already in use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**: Kill the process using the port or change the port in .env

**Issue**: ML Engine not responding
```
Error: spawn python ENOENT
```
**Solution**: Ensure Python is in PATH. Try `python --version` in terminal.

**Issue**: CORS errors in browser
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**: Verify CORS_ORIGIN in backend .env matches frontend URL

**Issue**: Module not found errors
```
ModuleNotFoundError: No module named 'flask'
```
**Solution**: Install Python dependencies: `pip install -r requirements.txt`

## Performance Considerations

1. **File Upload Limits**: Max 100MB per file, 10 files max
2. **Training Timeout**: Long-running training jobs use background threads
3. **Memory Management**: Large datasets may require increased Node.js heap size
4. **Concurrent Requests**: Rate limited to 100 requests per 15 minutes per IP

## Security Notes

1. **Helmet.js**: Enabled for security headers
2. **CORS**: Restricted to localhost in development
3. **File Validation**: Only CSV, XLSX, XLS, JSON, TXT allowed
4. **Rate Limiting**: Prevents API abuse
5. **Input Sanitization**: All user inputs validated before processing

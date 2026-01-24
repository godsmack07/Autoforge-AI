import json
from unittest import result
import joblib
import numpy as np
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

class ModelDeployer:
    def __init__(self):
        self.deployments_dir = 'deployments'
    
    def deploy(self, model_path, model_type, deployment_type='api'):
        """
        Deploy trained model
        
        deployment_type: 'api', 'docker', 'export', 'web'
        """
        try:
            # Load model
            model_data = joblib.load(model_path)
            model_info = model_data['model_info']
            
            deployment_id = f"deploy_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            if deployment_type == 'api':
                return self.deploy_as_api(model_data, model_info, deployment_id)
            
            elif deployment_type == 'docker':
                return self.deploy_as_docker(model_data, model_info, deployment_id)
            
            elif deployment_type == 'export':
                return self.export_model(model_data, model_info, deployment_id)
            
            elif deployment_type == 'web':
                return self.deploy_as_web(model_data, model_info, deployment_id)
            
            else:
                raise ValueError(f"Unknown deployment type: {deployment_type}")
            
        except Exception as e:
            raise Exception(f"Error deploying model: {str(e)}")
    
    def deploy_as_api(self, model_data, model_info, deployment_id):
        """Deploy model as REST API"""
        # Generate API specification
        api_spec = {
            'api_version': '1.0.0',
            'model_id': deployment_id,
            'endpoints': {
                'predict': {
                    'method': 'POST',
                    'url': f'/api/v1/models/{deployment_id}/predict',
                    'input_schema': {
                        'type': 'object',
                        'properties': {
                            'features': {
                                'type': 'array',
                                'items': {
                                    'type': 'number'
                                },
                                'description': 'Feature values in order'
                            }
                        },
                        'required': ['features']
                    },
                    'output_schema': {
                        'type': 'object',
                        'properties': {
                            'prediction': {'type': 'number'},
                            'confidence': {'type': 'number'},
                            'timestamp': {'type': 'string'}
                        }
                    }
                },
                'batch_predict': {
                    'method': 'POST',
                    'url': f'/api/v1/models/{deployment_id}/batch_predict',
                    'input_schema': {
                        'type': 'object',
                        'properties': {
                            'instances': {
                                'type': 'array',
                                'items': {
                                    'type': 'array',
                                    'items': {'type': 'number'}
                                }
                            }
                        }
                    }
                },
                'health': {
                    'method': 'GET',
                    'url': f'/api/v1/models/{deployment_id}/health'
                }
            },
            'model_info': model_info,
            'deployment_time': datetime.now().isoformat(),
            'status': 'active'
        }
        
        # Generate API key
        import secrets
        api_key = secrets.token_urlsafe(32)
        
        return {
            'deployment_id': deployment_id,
            'type': 'api',
            'api_key': api_key,
            'endpoint': f'https://api.autoforge.ai/v1/models/{deployment_id}',
            'specification': api_spec,
            'usage_examples': self.generate_usage_examples(api_spec, api_key),
            'monitoring': {
                'url': f'https://monitor.autoforge.ai/{deployment_id}',
                'dashboard': f'https://dashboard.autoforge.ai/models/{deployment_id}'
            }
        }
    
    def deploy_as_docker(self, model_data, model_info, deployment_id):
        """Generate Docker deployment files"""
        dockerfile = f"""FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY model.pkl .
COPY api_server.py .

EXPOSE 8080

CMD ["python", "api_server.py"]
"""
        
        requirements = """flask==3.0.0
numpy==1.24.3
scikit-learn==1.3.0
joblib==1.3.2
gunicorn==21.2.0
"""
        
        api_server = f"""from flask import Flask, request, jsonify
import joblib
import numpy as np
from datetime import datetime

app = Flask(__name__)

# Load model
model_data = joblib.load('model.pkl')
model = model_data['model']
scaler = model_data['scaler']
feature_columns = model_data['feature_columns']

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        features = np.array(data['features']).reshape(1, -1)
        
        # Scale features
        features_scaled = scaler.transform(features)
        
        # Make prediction
        prediction = model.predict(features_scaled)[0]
        
        return jsonify({{
            'prediction': float(prediction),
            'model_id': '{deployment_id}',
            'timestamp': datetime.now().isoformat(),
            'features_used': feature_columns
        }})
    except Exception as e:
        return jsonify({{'error': str(e)}}), 400

@app.route('/health', methods=['GET'])
def health():
    return jsonify({{
        'status': 'healthy',
        'model': '{model_info["model_name"]}',
        'deployment_id': '{deployment_id}'
    }})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
"""
        
        return {
            'deployment_id': deployment_id,
            'type': 'docker',
            'files': {
                'Dockerfile': dockerfile,
                'requirements.txt': requirements,
                'api_server.py': api_server
            },
            'commands': {
                'build': f'docker build -t autoforge-model-{deployment_id} .',
                'run': f'docker run -p 8080:8080 autoforge-model-{deployment_id}',
                'push': f'docker tag autoforge-model-{deployment_id} your-registry/autoforge-model-{deployment_id}:latest'
            }
        }
    
    def export_model(self, model_data, model_info, deployment_id):
        """Export model in various formats"""
        formats = {}
        
        # JSON format
        formats['json'] = {
            'model_info': model_info,
            'parameters': model_data['model'].get_params() if hasattr(model_data['model'], 'get_params') else {},
            'features': model_data['feature_columns'],
            'target': model_data['target_column']
        }
        
        # ONNX format (if available)
        try:
            import onnx
            from skl2onnx import convert_sklearn
            from skl2onnx.common.data_types import FloatTensorType
            
            initial_type = [('float_input', FloatTensorType([None, len(model_data['feature_columns'])]))]
            onnx_model = convert_sklearn(model_data['model'], initial_types=initial_type)
            
            formats['onnx'] = {
                'format': 'onnx',
                'input_shape': [None, len(model_data['feature_columns'])],
                'output_shape': [None, 1]
            }
        except:
            formats['onnx'] = {'error': 'ONNX conversion not available'}
        
        # TensorFlow format (if applicable)
        try:
            import tensorflow as tf
            if hasattr(model_data['model'], 'save'):
                formats['tensorflow'] = {
                    'format': 'keras',
                    'layers': len(model_data['model'].layers) if hasattr(model_data['model'], 'layers') else 'unknown'
                }
        except:
            formats['tensorflow'] = {'error': 'TensorFlow conversion not available'}
        
        return {
            'deployment_id': deployment_id,
            'type': 'export',
            'formats': formats,
            'download_links': {
                'json': f'/api/v1/models/{deployment_id}/download/json',
                'onnx': f'/api/v1/models/{deployment_id}/download/onnx',
                'pickle': f'/api/v1/models/{deployment_id}/download/pickle'
            }
        }
    
    def deploy_as_web(self, model_data, model_info, deployment_id):
        """Generate web application deployment"""
        web_app = {
            'html': f"""<!DOCTYPE html>
<html>
<head>
    <title>AutoForge Model: {model_info['model_name']}</title>
    <script src="https://cdn.plot.ly/plotly-2.24.1.min.js"></script>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 40px; }}
        .container {{ max-width: 800px; margin: 0 auto; }}
        .input-group {{ margin: 20px 0; }}
        input {{ padding: 10px; width: 100px; margin: 0 10px; }}
        button {{ padding: 10px 20px; background: #3b82f6; color: white; border: none; cursor: pointer; }}
        .result {{ margin-top: 20px; padding: 20px; background: #f0f9ff; border-radius: 5px; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>{model_info['model_name']}</h1>
        <p>Model ID: {deployment_id}</p>
        
        <div class="input-group">
            {"".join(f'<input type="number" id="feature{i}" placeholder="{col}" step="any"><br>' 
                    for i, col in enumerate(model_data['feature_columns']))}
        </div>
        
        <button onclick="predict()">Predict</button>
        
        <div class="result" id="result"></div>
        <div id="chart"></div>
    </div>
    
    <script>
    async function predict() {{
        const features = [{", ".join(f'document.getElementById("feature{i}").value' 
                                    for i in range(len(model_data['feature_columns'])))}];
        
        const response = await fetch('/api/v1/models/{deployment_id}/predict', {{
            method: 'POST',
            headers: {{ 'Content-Type': 'application/json' }},
            body: JSON.stringify({{ features }})
        }});
        
        const result = await response.json();
        document.getElementById('result').innerHTML = 
            `<h3>Prediction: ${result.prediction}</h3>
             <p>Model: {model_info['model_name']}</p>
             <p>Timestamp: ${result.timestamp}</p>`;
    }}
    </script>
</body>
</html>""",
            'javascript': f"""
// Web app JavaScript for {deployment_id}
const modelConfig = {{
    modelId: '{deployment_id}',
    features: {json.dumps(model_data['feature_columns'])},
    endpoint: '/api/v1/models/{deployment_id}/predict'
}};

async function makePrediction(featureValues) {{
    const response = await fetch(modelConfig.endpoint, {{
        method: 'POST',
        headers: {{ 'Content-Type': 'application/json' }},
        body: JSON.stringify({{ features: featureValues }})
    }});
    return await response.json();
}}
"""
        }
        
        return {
            'deployment_id': deployment_id,
            'type': 'web',
            'web_app': web_app,
            'embed_code': f"""
<!-- AutoForge Model Embed -->
<script src="https://cdn.autoforge.ai/widget.js?model={deployment_id}"></script>
<autoforge-widget 
    model-id="{deployment_id}"
    title="{model_info['model_name']}"
    features='{json.dumps(model_data['feature_columns'])}'
></autoforge-widget>
""",
            'hosting': {
                'static': 'Upload HTML/JS files to any static host',
                'github': f'https://github.com/yourusername/autoforge-model-{deployment_id}',
                'netlify': f'https://app.netlify.com/sites/autoforge-{deployment_id}/deploys'
            }
        }
    
    def generate_usage_examples(self, api_spec, api_key):
        """Generate usage examples for the API"""
        examples = {
            'python': f"""import requests

api_key = "{api_key}"
endpoint = "{api_spec['endpoints']['predict']['url']}"

headers = {{
    "Authorization": f"Bearer {{api_key}}",
    "Content-Type": "application/json"
}}

data = {{
    "features": [1.0, 2.0, 3.0, 4.0, 5.0]  # Replace with actual feature values
}}

response = requests.post(endpoint, json=data, headers=headers)
result = response.json()

print(f"Prediction: {{result['prediction']}}")
print(f"Confidence: {{result.get('confidence', 'N/A')}}")
""",
            'javascript': f"""const apiKey = "{api_key}";
const endpoint = "{api_spec['endpoints']['predict']['url']}";

async function predict(features) {{
    const response = await fetch(endpoint, {{
        method: 'POST',
        headers: {{
            'Authorization': `Bearer ${{apiKey}}`,
            'Content-Type': 'application/json'
        }},
        body: JSON.stringify({{ features }})
    }});
    
    return await response.json();
}}

// Usage
predict([1.0, 2.0, 3.0, 4.0, 5.0])
    .then(result => console.log('Prediction:', result.prediction));
""",
            'curl': f"""curl -X POST \\
  "{api_spec['endpoints']['predict']['url']}" \\
  -H "Authorization: Bearer {api_key}" \\
  -H "Content-Type: application/json" \\
  -d '{{"features": [1.0, 2.0, 3.0, 4.0, 5.0]}}'
""",
            'postman': {
                'method': 'POST',
                'url': api_spec['endpoints']['predict']['url'],
                'headers': {
                    'Authorization': f'Bearer {api_key}',
                    'Content-Type': 'application/json'
                },
                'body': {
                    'raw': '{"features": [1.0, 2.0, 3.0, 4.0, 5.0]}',
                    'type': 'application/json'
                }
            }
        }
        
        return examples
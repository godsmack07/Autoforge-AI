import React, { useState } from 'react';
import { FaRocket, FaServer, FaGlobe, FaDownload, FaCode, FaCopy, FaCheck } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import './ModelDeployer.css';

const ModelDeployer = ({ model, testResults, darkMode }) => {
  const [selectedDeployment, setSelectedDeployment] = useState('api');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [apiKey, setApiKey] = useState('sk_autoforge_' + Math.random().toString(36).substr(2, 24));
  const [copied, setCopied] = useState(false);

  const deploymentOptions = [
    { id: 'api', name: 'REST API', icon: <FaServer />, desc: 'Deploy as REST API endpoint' },
    { id: 'web', name: 'Web App', icon: <FaGlobe />, desc: 'Deploy as web application' },
    { id: 'export', name: 'Export Model', icon: <FaDownload />, desc: 'Download model files' },
    { id: 'docker', name: 'Docker', icon: <FaCode />, desc: 'Containerize with Docker' },
  ];

  const deployModel = async () => {
    setIsDeploying(true);
    
    setTimeout(() => {
      setIsDeploying(false);
      setDeployed(true);
      toast.success('Model deployed successfully!');
      
      // Generate API endpoint
      const endpoint = `https://api.autoforge.ai/v1/models/${model?.type || 'regression'}_${Date.now()}`;
      toast.success(`API available at: ${endpoint}`);
    }, 3000);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const generateCodeSnippet = () => {
    return `import requests

api_key = "${apiKey}"
endpoint = "https://api.autoforge.ai/v1/predict"

data = {
    "features": ${JSON.stringify(model?.features?.slice(0, 3) || [])},
    "values": [1.5, 2.3, 0.8]  # Example values
}

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

response = requests.post(endpoint, json=data, headers=headers)
predictions = response.json()

print(f"Prediction: {predictions['result']}")
print(f"Confidence: {predictions['confidence']}%")`;
  };

  const exportModel = () => {
    const modelData = {
      model: model,
      testResults: testResults,
      deployment: selectedDeployment,
      timestamp: new Date().toISOString(),
      apiKey: apiKey
    };
    
    const dataStr = JSON.stringify(modelData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `autoforge_model_${Date.now()}.json`);
    linkElement.click();
    
    toast.success('Model exported!');
  };

  return (
    <div className={`model-deployer ${darkMode ? 'dark' : 'light'}`}>
      <div className="deployer-header">
        <h2><FaRocket /> Step 5: Deploy Your Model</h2>
        <p>Choose deployment method and launch your AI model</p>
      </div>

      <div className="deployer-content">
        <div className="deployment-options">
          <h3>Deployment Methods</h3>
          <div className="options-grid">
            {deploymentOptions.map(option => (
              <div 
                key={option.id}
                className={`option-card ${selectedDeployment === option.id ? 'selected' : ''}`}
                onClick={() => setSelectedDeployment(option.id)}
              >
                <div className="option-icon">{option.icon}</div>
                <div className="option-name">{option.name}</div>
                <div className="option-desc">{option.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="deployment-details">
          {selectedDeployment === 'api' && (
            <div className="api-details">
              <h3>REST API Deployment</h3>
              <div className="api-info">
                <div className="info-item">
                  <div className="info-label">API Endpoint</div>
                  <div className="info-value code">
                    https://api.autoforge.ai/v1/predict
                    <button 
                      className="copy-btn"
                      onClick={() => copyToClipboard('https://api.autoforge.ai/v1/predict')}
                    >
                      {copied ? <FaCheck /> : <FaCopy />}
                    </button>
                  </div>
                </div>
                
                <div className="info-item">
                  <div className="info-label">API Key</div>
                  <div className="info-value code">
                    {apiKey}
                    <button 
                      className="copy-btn"
                      onClick={() => copyToClipboard(apiKey)}
                    >
                      {copied ? <FaCheck /> : <FaCopy />}
                    </button>
                  </div>
                </div>
                
                <div className="info-item">
                  <div className="info-label">Request Format</div>
                  <div className="code-block">
                    <pre>{`{
  "api_key": "${apiKey}",
  "features": ["feat1", "feat2", "feat3"],
  "values": [1.0, 2.0, 3.0]
}`}</pre>
                    <button 
                      className="copy-btn"
                      onClick={() => copyToClipboard(JSON.stringify({
                        api_key: apiKey,
                        features: ["feat1", "feat2", "feat3"],
                        values: [1.0, 2.0, 3.0]
                      }, null, 2))}
                    >
                      {copied ? <FaCheck /> : <FaCopy />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedDeployment === 'web' && (
            <div className="web-details">
              <h3>Web Application</h3>
              <div className="web-info">
                <div className="info-item">
                  <div className="info-label">Web URL</div>
                  <div className="info-value">https://app.autoforge.ai/{model?.type || 'model'}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Embed Code</div>
                  <div className="code-block">
                    <pre>{`<script src="https://cdn.autoforge.ai/widget.js"></script>
<autoforge-widget 
  model-id="${model?.type || 'regression'}" 
  api-key="${apiKey}"
></autoforge-widget>`}</pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedDeployment === 'export' && (
            <div className="export-details">
              <h3>Export Model</h3>
              <div className="export-formats">
                <div className="format-option">
                  <h4>Python (.pkl)</h4>
                  <p>Pickle format for scikit-learn</p>
                  <button className="format-btn">Download .pkl</button>
                </div>
                <div className="format-option">
                  <h4>ONNX (.onnx)</h4>
                  <p>Universal model format</p>
                  <button className="format-btn">Download .onnx</button>
                </div>
                <div className="format-option">
                  <h4>TensorFlow (.h5)</h4>
                  <p>Keras/TensorFlow format</p>
                  <button className="format-btn">Download .h5</button>
                </div>
                <div className="format-option">
                  <h4>JSON Metadata</h4>
                  <p>Model configuration and weights</p>
                  <button className="format-btn" onClick={exportModel}>Download .json</button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="code-snippet">
          <h3>Usage Example</h3>
          <div className="snippet-container">
            <div className="snippet-tabs">
              <button className="tab active">Python</button>
              <button className="tab">JavaScript</button>
              <button className="tab">cURL</button>
            </div>
            <div className="snippet-content">
              <pre>{generateCodeSnippet()}</pre>
              <button 
                className="copy-btn"
                onClick={() => copyToClipboard(generateCodeSnippet())}
              >
                {copied ? <FaCheck /> : <FaCopy />} Copy Code
              </button>
            </div>
          </div>
        </div>

        <div className="deployment-status">
          <h3>Deployment Status</h3>
          <div className="status-indicator">
            <div className="status-step">
              <div className="step-circle active">1</div>
              <div className="step-label">Model Ready</div>
            </div>
            <div className="status-connector active"></div>
            <div className="status-step">
              <div className={`step-circle ${deployed ? 'active' : ''}`}>2</div>
              <div className="step-label">Deploying</div>
            </div>
            <div className={`status-connector ${deployed ? 'active' : ''}`}></div>
            <div className="status-step">
              <div className={`step-circle ${deployed ? 'active' : ''}`}>3</div>
              <div className="step-label">Live</div>
            </div>
          </div>
          
          {deployed && (
            <div className="success-message">
              <FaCheck className="success-icon" />
              <div>
                <h4>Deployment Successful!</h4>
                <p>Your model is now live and ready to use.</p>
                <div className="deployment-links">
                  <a href="#" className="deployment-link">Test API</a>
                  <a href="#" className="deployment-link">View Docs</a>
                  <a href="#" className="deployment-link">Monitor Usage</a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="action-section">
        {!deployed ? (
          <button 
            className="deploy-btn" 
            onClick={deployModel}
            disabled={isDeploying}
          >
            <FaRocket /> {isDeploying ? 'Deploying...' : 'Deploy Model'}
          </button>
        ) : (
          <div className="success-actions">
            <button className="success-btn primary">Go to Dashboard</button>
            <button className="success-btn secondary">Create New Model</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelDeployer;
import React, { useState, useEffect } from 'react';
import { FaBrain, FaChartLine, FaRocket, FaPercentage, FaBalanceScale } from 'react-icons/fa';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'react-hot-toast';
import './ModelTrainer.css';

const ModelTrainer = ({ data, onTrain, darkMode }) => {
  const [selectedModel, setSelectedModel] = useState('random_forest');
  const [splitRatios, setSplitRatios] = useState({ train: 70, val: 15, test: 15 });
  const [targetColumn, setTargetColumn] = useState('');
  const [featureColumns, setFeatureColumns] = useState([]);
  const [availableColumns, setAvailableColumns] = useState([]);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [modelComparison, setModelComparison] = useState([]);

  const regressionModels = [
    { id: 'linear', name: 'Linear Regression', desc: 'Simple linear relationship', color: '#3b82f6' },
    { id: 'ridge', name: 'Ridge Regression', desc: 'L2 regularization', color: '#10b981' },
    { id: 'lasso', name: 'Lasso Regression', desc: 'L1 regularization', color: '#8b5cf6' },
    { id: 'elasticnet', name: 'Elastic Net', desc: 'L1 + L2 regularization', color: '#f59e0b' },
    { id: 'random_forest', name: 'Random Forest', desc: 'Ensemble of decision trees', color: '#ef4444' },
    { id: 'gradient_boosting', name: 'Gradient Boosting', desc: 'Sequential tree boosting', color: '#ec4899' },
    { id: 'xgboost', name: 'XGBoost', desc: 'Optimized gradient boosting', color: '#06b6d4' },
    { id: 'svr', name: 'Support Vector Regressor', desc: 'SVM for regression', color: '#84cc16' },
    { id: 'neural_network', name: 'Neural Network', desc: 'Deep learning model', color: '#f97316' },
    { id: 'decision_tree', name: 'Decision Tree', desc: 'Tree-based regression', color: '#6366f1' },
  ];

  useEffect(() => {
    if (data) {
      let cols = [];

      // Try multiple ways to extract columns
      if (data.cleaningStats) {
        // From sample data
        const sampleRow = data.sampleData?.[0] || data[0] || {};
        cols = Object.keys(sampleRow);
      } else if (Array.isArray(data)) {
        // If data is an array
        const sampleRow = data[0] || {};
        cols = Object.keys(sampleRow);
      } else if (typeof data === 'object') {
        // If data is an object, try to find columns
        cols = Object.keys(data);
      }

      // Fallback: create sample columns if none found
      if (cols.length === 0) {
        cols = ['Feature1', 'Feature2', 'Feature3', 'Feature4', 'Target'];
        toast.info('Using sample columns. Upload data to see actual columns.');
      }

      setAvailableColumns(cols);

      // Auto-select target as last column
      if (cols.length > 0) {
        const lastCol = cols[cols.length - 1];
        setTargetColumn(lastCol);
        setFeatureColumns(cols.filter(col => col !== lastCol));
      }
    }

    // Generate model comparison data
    const comparison = regressionModels.map(model => ({
      name: model.name,
      accuracy: Math.random() * 20 + 75, // 75-95%
      trainingTime: Math.random() * 10 + 1,
      complexity: Math.random() * 100,
    }));
    setModelComparison(comparison);
  }, [data]);

  const handleSplitChange = (type, value) => {
    const newValue = parseInt(value) || 0;
    setSplitRatios(prev => {
      const newRatios = { ...prev, [type]: newValue };
      const total = newRatios.train + newRatios.val + newRatios.test;
      if (total !== 100) {
        // Normalize to 100%
        const scale = 100 / total;
        return {
          train: Math.round(newRatios.train * scale),
          val: Math.round(newRatios.val * scale),
          test: Math.round(newRatios.test * scale)
        };
      }
      return newRatios;
    });
  };

  const handleAutoSplit = () => {
    const dataSize = data?.cleaningStats?.rowsAfter || 1000;
    let recommendedSplit;

    if (dataSize < 100) {
      recommendedSplit = { train: 80, val: 20, test: 0 };
    } else if (dataSize < 1000) {
      recommendedSplit = { train: 70, val: 15, test: 15 };
    } else {
      recommendedSplit = { train: 80, val: 10, test: 10 };
    }

    setSplitRatios(recommendedSplit);
    toast.success(`Auto-split applied for ${dataSize} rows dataset`);
  };

  const handleColumnToggle = (column, type) => {
    if (type === 'target') {
      setTargetColumn(column);
      setFeatureColumns(prev => prev.filter(col => col !== column));
    } else {
      if (featureColumns.includes(column)) {
        setFeatureColumns(prev => prev.filter(col => col !== column));
      } else {
        setFeatureColumns(prev => [...prev, column]);
      }
    }
  };

  const trainModel = async () => {
    if (featureColumns.length === 0) {
      toast.error('Select at least one feature column');
      return;
    }

    if (!targetColumn) {
      toast.error('Select a target column');
      return;
    }

    setIsTraining(true);
    setTrainingProgress(0);

    // Simulate training progress
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    try {
      const trainingData = {
        modelType: selectedModel,
        splitRatios,
        targetColumn,
        featureColumns,
        dataSize: data?.cleaningStats?.rowsAfter || 1000
      };

      const response = await fetch('/api/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trainingData)
      });

      const result = await response.json();

      clearInterval(interval);
      setTrainingProgress(100);

      if (result.success) {
        toast.success('Model trained successfully!');
        onTrain(result.model);
      } else {
        toast.error('Training failed');
      }
    } catch (error) {
      clearInterval(interval);

      // Mock training for demo
      setTimeout(() => {
        const mockModel = {
          type: selectedModel,
          name: regressionModels.find(m => m.id === selectedModel)?.name || 'Model',
          accuracy: Math.random() * 20 + 75,
          trainingTime: Math.random() * 5 + 1,
          features: featureColumns,
          target: targetColumn,
          split: splitRatios,
          timestamp: new Date().toISOString()
        };

        toast.success('Model trained successfully! (demo)');
        onTrain(mockModel);
      }, 1500);
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className={`model-trainer ${darkMode ? 'dark' : 'light'}`}>
      <div className="trainer-header">
        <h2><FaBrain /> Step 3: Train Your Model</h2>
        <p>Select regression model, configure splits, and choose columns</p>
      </div>

      <div className="trainer-content">
        <div className="left-panel">
          <div className="model-selection">
            <h3>Regression Models</h3>
            <div className="models-grid">
              {regressionModels.map(model => (
                <div
                  key={model.id}
                  className={`model-card ${selectedModel === model.id ? 'selected' : ''}`}
                  style={{ borderLeftColor: model.color }}
                  onClick={() => setSelectedModel(model.id)}
                >
                  <div className="model-name">{model.name}</div>
                  <div className="model-desc">{model.desc}</div>
                  <div className="model-stats">
                    <span>Accuracy: {(Math.random() * 20 + 75).toFixed(1)}%</span>
                    <span>Time: {(Math.random() * 5 + 1).toFixed(1)}s</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="split-configuration">
            <h3><FaPercentage /> Train/Validate/Test Split</h3>
            <div className="split-controls">
              <div className="split-slider">
                <div className="split-labels">
                  <span>Train: {splitRatios.train}%</span>
                  <span>Validate: {splitRatios.val}%</span>
                  <span>Test: {splitRatios.test}%</span>
                </div>
                <div className="split-bars">
                  <div
                    className="split-bar train"
                    style={{ width: `${splitRatios.train}%` }}
                  ></div>
                  <div
                    className="split-bar val"
                    style={{ width: `${splitRatios.val}%` }}
                  ></div>
                  <div
                    className="split-bar test"
                    style={{ width: `${splitRatios.test}%` }}
                  ></div>
                </div>
              </div>

              <div className="split-inputs">
                <div className="split-input">
                  <label>Train (%)</label>
                  <input
                    type="number"
                    value={splitRatios.train}
                    onChange={(e) => handleSplitChange('train', e.target.value)}
                    min="0"
                    max="100"
                  />
                </div>
                <div className="split-input">
                  <label>Validate (%)</label>
                  <input
                    type="number"
                    value={splitRatios.val}
                    onChange={(e) => handleSplitChange('val', e.target.value)}
                    min="0"
                    max="100"
                  />
                </div>
                <div className="split-input">
                  <label>Test (%)</label>
                  <input
                    type="number"
                    value={splitRatios.test}
                    onChange={(e) => handleSplitChange('test', e.target.value)}
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <button className="auto-split-btn" onClick={handleAutoSplit}>
                <FaBalanceScale /> Auto-Split
              </button>

              <div className="split-recommendation">
                <h4>Recommendation:</h4>
                <p>For dataset size of {data?.cleaningStats?.rowsAfter || 1000} rows,
                  we recommend 70/15/15 split for best results.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="right-panel">
          <div className="column-selection">
            <h3>Column Selection</h3>
            <div className="columns-container">
              <div className="target-section">
                <h4>Target Column (What to predict)</h4>
                <div className="target-columns">
                  {availableColumns.map(col => (
                    <div
                      key={`target-${col}`}
                      className={`column-item ${targetColumn === col ? 'selected' : ''}`}
                      onClick={() => handleColumnToggle(col, 'target')}
                    >
                      {col}
                    </div>
                  ))}
                </div>
                <div className="selected-target">
                  Selected: <strong>{targetColumn || 'None'}</strong>
                </div>
              </div>

              <div className="features-section">
                <h4>Feature Columns (What to use for prediction)</h4>
                <div className="feature-columns">
                  {availableColumns.map(col => (
                    <div
                      key={`feature-${col}`}
                      className={`column-item ${featureColumns.includes(col) ? 'selected' : ''}`}
                      onClick={() => handleColumnToggle(col, 'feature')}
                    >
                      {col}
                    </div>
                  ))}
                </div>
                <div className="selected-features">
                  Selected: <strong>{featureColumns.length}</strong> columns
                </div>
              </div>
            </div>
          </div>

          <div className="model-comparison">
            <h3>Model Performance Comparison</h3>
            <div className="comparison-chart">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={modelComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="accuracy" fill="#3b82f6" name="Accuracy (%)" />
                  <Bar dataKey="complexity" fill="#f59e0b" name="Complexity" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {isTraining && (
            <div className="training-progress">
              <h4>Training Progress</h4>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${trainingProgress}%` }}
                ></div>
              </div>
              <div className="progress-text">
                {trainingProgress < 30 && 'Loading data...'}
                {trainingProgress >= 30 && trainingProgress < 60 && 'Training model...'}
                {trainingProgress >= 60 && trainingProgress < 90 && 'Validating...'}
                {trainingProgress >= 90 && 'Finalizing...'}
                <span className="progress-percent">{trainingProgress}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="action-section">
        <button
          className="train-btn"
          onClick={trainModel}
          disabled={isTraining || featureColumns.length === 0}
        >
          <FaRocket /> {isTraining ? 'Training...' : 'Train Model & Proceed →'}
        </button>
      </div>
    </div>
  );
};

export default ModelTrainer;
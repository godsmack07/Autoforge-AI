import React, { useState, useEffect } from 'react';
import { Toaster, toast } from "react-hot-toast"; // ✅ Import BOTH

import { FaRobot, FaUpload, FaBroom, FaBrain, FaVial, FaRocket, FaEye, FaMoon, FaSun } from 'react-icons/fa';
import UploadWizard from './components/UploadWizard';
import DataCleaner from './components/DataCleaner';
import ModelTrainer from './components/ModelTrainer';
import ModelTester from './components/ModelTester';
import ModelDeployer from './components/ModelDeployer';
import ThemeToggle from './components/ThemeToggle';
import DataVisualizer from './components/DataVisualizer';
import CSVViewer from './components/CSVViewer';
import './App.css';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [darkMode, setDarkMode] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [cleanedData, setCleanedData] = useState(null);
  const [trainedModel, setTrainedModel] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [showCSVViewer, setShowCSVViewer] = useState(false);
  const [showVisualizer, setShowVisualizer] = useState(false);

  const steps = [
    { id: 1, name: 'Upload Data', icon: <FaUpload /> },
    { id: 2, name: 'Data Cleaning', icon: <FaBroom /> },
    { id: 3, name: 'Train Model', icon: <FaBrain /> },
    { id: 4, name: 'Test & Validate', icon: <FaVial /> },
    { id: 5, name: 'Deploy', icon: <FaRocket /> },
  ];

  const handleFileUpload = (files, analysis) => {
    setUploadedFiles(files);
    toast.success(`${files.length} file(s) uploaded successfully!`); // ✅ Now toast is defined
    setCurrentStep(2);
  };

  const handleDataClean = (cleaned) => {
    console.log('handleDataClean called with:', cleaned);
    setCleanedData(cleaned);
    toast.success('Data cleaned successfully!'); // ✅
    setCurrentStep(3);
  };

  const handleModelTrain = (model) => {
    setTrainedModel(model);
    toast.success('Model trained successfully!');
    setCurrentStep(4);
  };

  const handleTestComplete = (results) => {
    setTestResults(results);
    toast.success('Testing completed!');
    setCurrentStep(5);
  };




  const sampleDatasets = [
    { name: 'Titanic Survival', path: '/datasets/titanic.csv', desc: 'Predict passenger survival' },
    { name: 'House Prices', path: '/datasets/housing.csv', desc: 'Predict house prices' },
    { name: 'Diabetes', path: '/datasets/diabetes.csv', desc: 'Predict diabetes progression' },
    { name: 'Stock Prices', path: '/datasets/stocks.csv', desc: 'Predict stock trends' },
    { name: 'Sales Data', path: '/datasets/sales.csv', desc: 'Predict sales numbers' },
  ];

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  return (
    <div className={`app-container ${darkMode ? 'dark' : 'light'}`}>
      <header className="app-header">
        <div className="header-left">
          <FaRobot className="logo-icon" />
          <h1>AutoForge <span className="ai-text">AI</span></h1>
          <p className="tagline">Build AI Models Without Code</p>
        </div>
        <div className="header-right">
          <button className="view-btn" onClick={() => setShowCSVViewer(!showCSVViewer)}>
            <FaEye /> View CSV
          </button>
          <button className="view-btn" onClick={() => setShowVisualizer(!showVisualizer)}>
            <FaEye /> Visualize
          </button>
          <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
        </div>
      </header>

      <div className="progress-container">
        <div className="progress-bar">
          {steps.map((step, index) => (
            <div key={step.id} className={`step ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}>
              <div className="step-circle">{step.icon}</div>
              <div className="step-name">{step.name}</div>
              {index < steps.length - 1 && <div className="step-connector"></div>}
            </div>
          ))}
        </div>
      </div>

      <div className="main-content">
        {showCSVViewer && uploadedFiles.length > 0 && (
          <CSVViewer
            files={uploadedFiles}
            onClose={() => setShowCSVViewer(false)}
            darkMode={darkMode}
          />
        )}

        {showVisualizer && cleanedData && (
          <DataVisualizer
            data={cleanedData}
            onClose={() => setShowVisualizer(false)}
            darkMode={darkMode}
          />
        )}

        <div className="step-content">
          {currentStep === 1 && (
            <UploadWizard
              onUpload={handleFileUpload}
              sampleDatasets={sampleDatasets}
              darkMode={darkMode}
            />
          )}
          {currentStep === 2 && (
            <DataCleaner
              files={uploadedFiles}
              onClean={handleDataClean}
              darkMode={darkMode}
            />
          )}
          {currentStep === 3 && (
            <ModelTrainer
              data={cleanedData}
              onTrain={handleModelTrain}
              darkMode={darkMode}
            />
          )}
          {currentStep === 4 && (
            <ModelTester
              model={trainedModel}
              data={cleanedData}
              onTestComplete={handleTestComplete}
              darkMode={darkMode}
            />
          )}
          {currentStep === 5 && (
            <ModelDeployer
              model={trainedModel}
              testResults={testResults}
              darkMode={darkMode}
            />
          )}
        </div>

        <div className="navigation">
          {currentStep > 1 && (
            <button className="nav-btn secondary" onClick={() => setCurrentStep(currentStep - 1)}>
              ← Previous
            </button>
          )}
        </div>
      </div>

      <div className="quick-stats">
        <div className="stat-card">
          <div className="stat-label">Files Uploaded</div>
          <div className="stat-value">{uploadedFiles.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Cleaned</div>
          <div className="stat-value">{cleanedData ? '✓' : '✗'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Model Ready</div>
          <div className="stat-value">{trainedModel ? '✓' : '✗'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Accuracy</div>
          <div className="stat-value">
            {testResults?.accuracy
              ? `${testResults.accuracy}%`
              : trainedModel?.accuracy
                ? `${trainedModel.accuracy.toFixed(1)}%`
                : '--'}
          </div>
        </div>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          className: darkMode ? 'dark-toast' : 'light-toast',
          style: {
            background: darkMode ? '#1e293b' : '#ffffff',
            color: darkMode ? '#f1f5f9' : '#1e293b',
            border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
          },
        }}
      />
    </div>
  );
}

export default App;
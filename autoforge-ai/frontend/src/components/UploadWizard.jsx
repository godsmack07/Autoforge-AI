import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaUpload, FaRandom, FaExclamationTriangle, FaCheck, FaTimes } from 'react-icons/fa';
import Papa from 'papaparse';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import './UploadWizard.css';

const UploadWizard = ({ onUpload, sampleDatasets, darkMode }) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dataAnalysis, setDataAnalysis] = useState(null);
  const [selectedSample, setSelectedSample] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    setIsAnalyzing(true);

    const filesWithAnalysis = [];
    const analyses = [];

    // Upload files to backend first
    try {
      const formData = new FormData();
      acceptedFiles.forEach(file => {
        formData.append('files', file);
      });

      // Upload to backend
      const uploadResponse = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (uploadResponse.data.success) {
        toast.success(`Uploaded ${acceptedFiles.length} file(s) to server`);
      }
    } catch (error) {
      toast.error(`Upload failed: ${error.message}`);
      console.error('Upload error:', error);
    }

    // Then analyze locally for immediate feedback
    for (const file of acceptedFiles) {
      try {
        const analysis = await analyzeCSV(file);
        filesWithAnalysis.push({ file, analysis });
        analyses.push(analysis);

        toast.success(`Analyzed ${file.name}`);
      } catch (error) {
        toast.error(`Failed to analyze ${file.name}: ${error.message}`);
      }
    }

    setUploadedFiles(filesWithAnalysis);

    if (filesWithAnalysis.length > 0) {
      const combinedAnalysis = combineAnalyses(analyses);
      setDataAnalysis(combinedAnalysis);
    }

    setIsAnalyzing(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls', '.xlsx'],
      'text/plain': ['.txt']
    },
    multiple: true
  });

  const analyzeCSV = (file) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        preview: 100,
        complete: (results) => {
          const issues = [];
          const headers = results.meta.fields || [];
          const data = results.data;

          // Check for missing values
          data.forEach((row, rowIndex) => {
            headers.forEach((header) => {
              const value = row[header];
              if (value === null || value === undefined || value === '') {
                issues.push({
                  type: 'missing',
                  row: rowIndex + 2,
                  column: header,
                  value: 'Empty'
                });
              } else if (typeof value === 'string' && value.toLowerCase() === 'nan') {
                issues.push({
                  type: 'invalid',
                  row: rowIndex + 2,
                  column: header,
                  value: 'NaN'
                });
              }
            });
          });

          // Check data types
          const columnTypes = {};
          headers.forEach(header => {
            const sampleValues = data.slice(0, 10).map(row => row[header]).filter(v => v != null);
            if (sampleValues.length > 0) {
              const firstType = typeof sampleValues[0];
              columnTypes[header] = firstType;
            }
          });

          resolve({
            filename: file.name,
            size: file.size,
            rows: data.length,
            columns: headers.length,
            headers,
            sampleData: data.slice(0, 5),
            issues,
            columnTypes,
            hasIssues: issues.length > 0
          });
        },
        error: (error) => reject(error)
      });
    });
  };

  const combineAnalyses = (analyses) => {
    return {
      totalFiles: analyses.length,
      totalRows: analyses.reduce((sum, a) => sum + a.rows, 0),
      totalColumns: analyses[0]?.columns || 0,
      allIssues: analyses.flatMap(a => a.issues),
      columnStats: analyses[0]?.columnTypes || {}
    };
  };

  const handleUseSample = (dataset) => {
    setSelectedSample(dataset);
    toast.success(`Selected ${dataset.name} dataset`);

    // Simulate analysis for sample
    const mockAnalysis = {
      filename: dataset.name + '.csv',
      size: 1024 * 500,
      rows: 1000,
      columns: 15,
      headers: ['id', 'feature1', 'feature2', 'feature3', 'target'],
      sampleData: [
        { id: 1, feature1: 25, feature2: 50000, feature3: 'A', target: 1 },
        { id: 2, feature1: 30, feature2: 75000, feature3: 'B', target: 0 },
        { id: 3, feature1: 22, feature2: 45000, feature3: 'A', target: 1 },
      ],
      issues: [
        { type: 'missing', row: 45, column: 'feature2', value: 'Empty' },
        { type: 'invalid', row: 67, column: 'feature3', value: 'NaN' }
      ],
      columnTypes: {
        id: 'number',
        feature1: 'number',
        feature2: 'number',
        feature3: 'string',
        target: 'number'
      },
      hasIssues: true
    };

    setDataAnalysis(mockAnalysis);
    setUploadedFiles([{ file: { name: dataset.name + '.csv' }, analysis: mockAnalysis }]);
  };

  const handleRandomDataset = () => {
    const randomIndex = Math.floor(Math.random() * sampleDatasets.length);
    handleUseSample(sampleDatasets[randomIndex]);
  };

  const handleProceed = () => {
    if (uploadedFiles.length === 0) {
      toast.error('Please upload files first');
      return;
    }
    onUpload(uploadedFiles, dataAnalysis);
  };

  return (
    <div className={`upload-wizard ${darkMode ? 'dark' : 'light'}`}>
      <div className="wizard-header">
        <h2><FaUpload /> Step 1: Upload Your Data</h2>
        <p>Upload CSV files or use sample datasets. We'll analyze your data for issues.</p>
      </div>

      <div className="wizard-content">
        <div className="upload-section">
          <div
            {...getRootProps()}
            className={`dropzone ${isDragActive ? 'active' : ''} ${darkMode ? 'dark' : 'light'}`}
          >
            <input {...getInputProps()} />
            <FaUpload className="upload-icon" />
            <h3>Drag & Drop CSV Files</h3>
            <p>or click to browse</p>
            <p className="file-types">Supports: CSV, Excel (max 100MB each)</p>
            <p className="file-count">{uploadedFiles.length} file(s) uploaded</p>
          </div>

          <div className="sample-section">
            <h3>Try Sample Datasets</h3>
            <button className="random-btn" onClick={handleRandomDataset}>
              <FaRandom /> Random Dataset
            </button>

            <div className="sample-grid">
              {sampleDatasets.map(dataset => (
                <div
                  key={dataset.name}
                  className={`sample-card ${selectedSample?.name === dataset.name ? 'selected' : ''}`}
                  onClick={() => handleUseSample(dataset)}
                >
                  <div className="sample-name">{dataset.name}</div>
                  <div className="sample-desc">{dataset.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {dataAnalysis && (
          <div className="analysis-section">
            <h3>Data Analysis Report</h3>

            <div className="stats-grid">
              <div className="stat">
                <div className="stat-label">Files</div>
                <div className="stat-value">{dataAnalysis.totalFiles || 1}</div>
              </div>
              <div className="stat">
                <div className="stat-label">Total Rows</div>
                <div className="stat-value">{dataAnalysis.totalRows || dataAnalysis.rows}</div>
              </div>
              <div className="stat">
                <div className="stat-label">Columns</div>
                <div className="stat-value">{dataAnalysis.totalColumns || dataAnalysis.columns}</div>
              </div>
              <div className="stat">
                <div className="stat-label">Issues Found</div>
                <div className="stat-value error">
                  {(dataAnalysis.allIssues || dataAnalysis.issues).length}
                </div>
              </div>
            </div>

            {(dataAnalysis.allIssues || dataAnalysis.issues).length > 0 && (
              <div className="issues-section">
                <h4><FaExclamationTriangle /> Data Issues Detected</h4>
                <div className="issues-list">
                  {(dataAnalysis.allIssues || dataAnalysis.issues).slice(0, 10).map((issue, idx) => (
                    <div key={idx} className="issue-item">
                      <span className="issue-type">{issue.type.toUpperCase()}</span>
                      <span>Row {issue.row}, Column {issue.column}</span>
                      <span className="issue-value">Value: {issue.value}</span>
                    </div>
                  ))}
                  {(dataAnalysis.allIssues || dataAnalysis.issues).length > 10 && (
                    <div className="issue-more">
                      ... and {(dataAnalysis.allIssues || dataAnalysis.issues).length - 10} more issues
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="preview-section">
              <h4>Data Preview</h4>
              <div className="preview-table">
                <table>
                  <thead>
                    <tr>
                      {dataAnalysis.headers?.map((header, idx) => (
                        <th key={idx}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dataAnalysis.sampleData?.map((row, rowIdx) => (
                      <tr key={rowIdx}>
                        {dataAnalysis.headers?.map((header, colIdx) => (
                          <td key={colIdx}>{row[header]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <div className="action-section">
          <button
            className="proceed-btn"
            onClick={handleProceed}
            disabled={uploadedFiles.length === 0}
          >
            {isAnalyzing ? 'Analyzing...' : 'Proceed to Data Cleaning →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadWizard;
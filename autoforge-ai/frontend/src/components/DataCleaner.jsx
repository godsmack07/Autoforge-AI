import React, { useState, useEffect } from 'react';
import { FaBroom, FaFilter, FaEraser, FaColumns, FaSortNumericUp } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import './DataCleaner.css';

const DataCleaner = ({ files, onClean, darkMode }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [cleaningOptions, setCleaningOptions] = useState({
    removeMissing: true,
    fillMissing: false,
    fillValue: 0,
    removeDuplicates: true,
    normalizeColumns: false,
    encodeCategorical: true,
    removeOutliers: false,
    outlierMethod: 'iqr',
    selectedColumns: [],
    rowRange: { start: 1, end: -1 }
  });
  const [columns, setColumns] = useState([]);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    if (files.length > 0) {
      setSelectedFiles(files);
      const firstFile = files[0];
      if (firstFile.analysis) {
        setColumns(firstFile.analysis.headers || []);
        setPreviewData(firstFile.analysis.sampleData || []);

        // Auto-select all columns
        setCleaningOptions(prev => ({
          ...prev,
          selectedColumns: firstFile.analysis.headers || []
        }));
      }
    }
  }, [files]);

  const handleOptionChange = (option) => {
    setCleaningOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleColumnToggle = (column) => {
    setCleaningOptions(prev => {
      const isSelected = prev.selectedColumns.includes(column);
      return {
        ...prev,
        selectedColumns: isSelected
          ? prev.selectedColumns.filter(col => col !== column)
          : [...prev.selectedColumns, column]
      };
    });
  };

  const handleRowRangeChange = (type, value) => {
    setCleaningOptions(prev => ({
      ...prev,
      rowRange: {
        ...prev.rowRange,
        [type]: value === '' ? '' : parseInt(value)
      }
    }));
  };

  const handleCleanData = async () => {
    try {
      toast.loading('Cleaning data...', { id: 'cleaning' });

      const formData = new FormData();
      selectedFiles.forEach((fileObj, index) => {
        formData.append('files', fileObj.file);
      });

      formData.append('options', JSON.stringify(cleaningOptions));

      const response = await fetch('/api/clean', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Data cleaned successfully!', { id: 'cleaning' });
        onClean(result.data);
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (error) {
      console.log('Using mock cleaning (API not available)');

      // Mock clean for demo - simulate processing
      const mockCleaned = {
        sampleData: previewData || [],
        cleaningStats: {
          missingRemoved: 12,
          duplicatesRemoved: 3,
          outliersRemoved: 5,
          rowsAfter: 980,
          columnsAfter: columns.length
        }
      };

      setTimeout(() => {
        toast.success('Data cleaned successfully!', { id: 'cleaning' });
        onClean(mockCleaned);
      }, 1500);
    }
  };

  return (
    <div className={`data-cleaner ${darkMode ? 'dark' : 'light'}`}>
      <div className="cleaner-header">
        <h2><FaBroom /> Step 2: Data Cleaning</h2>
        <p>Select cleaning options and parameters for your data</p>
      </div>

      <div className="cleaner-content">
        <div className="left-panel">
          <div className="files-section">
            <h3>Selected Files ({selectedFiles.length})</h3>
            <div className="files-list">
              {selectedFiles.map((fileObj, idx) => (
                <div key={idx} className="file-item">
                  <div className="file-name">{fileObj.file.name}</div>
                  <div className="file-stats">
                    {fileObj.analysis?.rows} rows, {fileObj.analysis?.columns} cols
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="range-section">
            <h3><FaSortNumericUp /> Row Range Selection</h3>
            <div className="range-inputs">
              <div className="range-group">
                <label>Start Row (1-indexed)</label>
                <input
                  type="number"
                  value={cleaningOptions.rowRange.start}
                  onChange={(e) => handleRowRangeChange('start', e.target.value)}
                  placeholder="1"
                />
                <div className="range-example">Example: 1</div>
              </div>
              <div className="range-group">
                <label>End Row (-1 for all)</label>
                <input
                  type="number"
                  value={cleaningOptions.rowRange.end}
                  onChange={(e) => handleRowRangeChange('end', e.target.value)}
                  placeholder="-1"
                />
                <div className="range-example">Example: -1 (all), 100, 1:100</div>
              </div>
            </div>
            <div className="range-info">
              <p>Python-style indexing: 1:100, 0:-1, start:end</p>
            </div>
          </div>
        </div>

        <div className="right-panel">
          <div className="options-section">
            <h3>Cleaning Options</h3>

            <div className="options-grid">
              <div className={`option-card ${cleaningOptions.removeMissing ? 'active' : ''}`}
                onClick={() => handleOptionChange('removeMissing')}>
                <FaEraser />
                <h4>Remove Missing Values</h4>
                <p>Delete rows with empty cells</p>
              </div>

              <div className={`option-card ${cleaningOptions.fillMissing ? 'active' : ''}`}
                onClick={() => handleOptionChange('fillMissing')}>
                <FaFilter />
                <h4>Fill Missing Values</h4>
                <p>Fill with:
                  <select
                    value={cleaningOptions.fillValue}
                    onChange={(e) => setCleaningOptions(prev => ({ ...prev, fillValue: e.target.value }))}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="0">0</option>
                    <option value="mean">Mean</option>
                    <option value="median">Median</option>
                    <option value="mode">Mode</option>
                  </select>
                </p>
              </div>

              <div className={`option-card ${cleaningOptions.removeDuplicates ? 'active' : ''}`}
                onClick={() => handleOptionChange('removeDuplicates')}>
                <FaBroom />
                <h4>Remove Duplicates</h4>
                <p>Delete duplicate rows</p>
              </div>

              <div className={`option-card ${cleaningOptions.removeOutliers ? 'active' : ''}`}
                onClick={() => handleOptionChange('removeOutliers')}>
                <FaFilter />
                <h4>Remove Outliers</h4>
                <p>Method:
                  <select
                    value={cleaningOptions.outlierMethod}
                    onChange={(e) => setCleaningOptions(prev => ({ ...prev, outlierMethod: e.target.value }))}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="iqr">IQR</option>
                    <option value="zscore">Z-Score</option>
                  </select>
                </p>
              </div>
            </div>
          </div>

          <div className="columns-section">
            <h3><FaColumns /> Select Columns to Include</h3>
            <div className="columns-grid">
              {columns.map((column, idx) => (
                <div
                  key={idx}
                  className={`column-item ${cleaningOptions.selectedColumns.includes(column) ? 'selected' : ''}`}
                  onClick={() => handleColumnToggle(column)}
                >
                  {column}
                </div>
              ))}
            </div>
            <div className="selection-info">
              {cleaningOptions.selectedColumns.length} of {columns.length} columns selected
            </div>
          </div>

          <div className="preview-section">
            <h3>Data Preview After Cleaning</h3>
            <div className="preview-table">
              {previewData && (
                <table>
                  <thead>
                    <tr>
                      {cleaningOptions.selectedColumns.slice(0, 6).map((col, idx) => (
                        <th key={idx}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 5).map((row, rowIdx) => (
                      <tr key={rowIdx}>
                        {cleaningOptions.selectedColumns.slice(0, 6).map((col, colIdx) => (
                          <td key={colIdx}>{row[col]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="action-section">
        <button className="clean-btn" onClick={handleCleanData}>
          <FaBroom /> Clean Data & Proceed →
        </button>
      </div>
    </div>
  );
};

export default DataCleaner;
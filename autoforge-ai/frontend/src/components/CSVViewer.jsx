import React, { useState, useEffect } from 'react';
import { FaTimes, FaSearch, FaFilter, FaSort, FaDownload } from 'react-icons/fa';
import './CSVViewer.css';
// Add this import at the top of each file
import { toast } from 'react-hot-toast';
const CSVViewer = ({ files, onClose, darkMode }) => {
  const [selectedFile, setSelectedFile] = useState(0);
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(20);

  useEffect(() => {
    if (files.length > 0 && files[selectedFile]) {
      const fileData = files[selectedFile];
      if (fileData.analysis?.sampleData) {
        setData(fileData.analysis.sampleData);
        setColumns(fileData.analysis.headers || []);
      }
    }
  }, [files, selectedFile]);

  useEffect(() => {
    let result = [...data];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(row => 
        Object.values(row).some(value => 
          String(value).toLowerCase().includes(term)
        )
      );
    }
    
    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    setFilteredData(result);
  }, [data, searchTerm, sortConfig]);

  const handleSort = (column) => {
    let direction = 'asc';
    if (sortConfig.key === column && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: column, direction });
  };

  const handleDownload = () => {
    const csvContent = [
      columns.join(','),
      ...filteredData.map(row => columns.map(col => row[col]).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `view_${files[selectedFile]?.file?.name || 'data'}.csv`;
    a.click();
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  return (
    <div className={`csv-viewer ${darkMode ? 'dark' : 'light'}`}>
      <div className="viewer-header">
        <div className="header-left">
          <h3>CSV Viewer</h3>
          <div className="file-selector">
            <select 
              value={selectedFile} 
              onChange={(e) => setSelectedFile(parseInt(e.target.value))}
            >
              {files.map((file, index) => (
                <option key={index} value={index}>
                  {file.file.name} ({file.analysis?.rows} rows)
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="header-right">
          <button className="download-btn" onClick={handleDownload}>
            <FaDownload /> Download
          </button>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
      </div>

      <div className="viewer-controls">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search in data..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>
              Clear
            </button>
          )}
        </div>
        
        <div className="viewer-stats">
          <span>Total: {filteredData.length} rows</span>
          <span>Columns: {columns.length}</span>
          <span>Page: {currentPage} of {totalPages}</span>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th key={index} onClick={() => handleSort(column)}>
                  {column}
                  <FaSort className={`sort-icon ${
                    sortConfig.key === column ? sortConfig.direction : ''
                  }`} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <td key={colIndex}>
                    {row[column] === null || row[column] === undefined ? (
                      <span className="missing-value">NULL</span>
                    ) : (
                      String(row[column])
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button 
          className="page-btn" 
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        
        <div className="page-numbers">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <button
                key={pageNum}
                className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
        
        <button 
          className="page-btn" 
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CSVViewer;
import React, { useState, useEffect } from 'react';
import { FaTimes, FaChartLine, FaChartBar, FaChartPie, FaMap } from 'react-icons/fa';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './DataVisualizer.css';
import { toast } from 'react-hot-toast';
const DataVisualizer = ({ data, onClose, darkMode }) => {
  const [selectedChart, setSelectedChart] = useState('line');
  const [chartData, setChartData] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState('');
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    if (data && data.sampleData) {
      const sample = data.sampleData;
      if (sample.length > 0) {
        const cols = Object.keys(sample[0]);
        setColumns(cols);
        setSelectedColumn(cols[0] || '');
        
        // Generate chart data
        const chartData = sample.slice(0, 20).map((row, index) => ({
          index,
          ...row
        }));
        setChartData(chartData);
      }
    }
  }, [data]);

  const charts = [
    { id: 'line', name: 'Line Chart', icon: <FaChartLine /> },
    { id: 'bar', name: 'Bar Chart', icon: <FaChartBar /> },
    { id: 'pie', name: 'Pie Chart', icon: <FaChartPie /> },
    { id: 'scatter', name: 'Scatter Plot', icon: <FaMap /> },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const renderChart = () => {
    if (!selectedColumn || chartData.length === 0) return null;

    const dataForChart = chartData.map(item => ({
      name: `Row ${item.index + 1}`,
      value: parseFloat(item[selectedColumn]) || 0
    }));

    switch (selectedChart) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={dataForChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={dataForChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={dataForChart}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
              >
                {dataForChart.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`data-visualizer ${darkMode ? 'dark' : 'light'}`}>
      <div className="visualizer-header">
        <h3>Data Visualization</h3>
        <button className="close-btn" onClick={onClose}>
          <FaTimes />
        </button>
      </div>

      <div className="visualizer-controls">
        <div className="chart-selector">
          {charts.map(chart => (
            <button
              key={chart.id}
              className={`chart-btn ${selectedChart === chart.id ? 'active' : ''}`}
              onClick={() => setSelectedChart(chart.id)}
            >
              {chart.icon} {chart.name}
            </button>
          ))}
        </div>

        <div className="column-selector">
          <label>Select Column:</label>
          <select 
            value={selectedColumn} 
            onChange={(e) => setSelectedColumn(e.target.value)}
          >
            {columns.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="chart-container">
        {renderChart()}
      </div>

      <div className="data-stats">
        {data?.cleaningStats && (
          <div className="stats-grid">
            <div className="stat">
              <div className="stat-label">Total Rows</div>
              <div className="stat-value">{data.cleaningStats.rowsAfter}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Columns</div>
              <div className="stat-value">{data.cleaningStats.columnsAfter}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Missing Values</div>
              <div className="stat-value">{data.cleaningStats.missingRemoved}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Duplicates</div>
              <div className="stat-value">{data.cleaningStats.duplicatesRemoved}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataVisualizer;
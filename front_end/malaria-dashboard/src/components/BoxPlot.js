// src/components/BoxPlot.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';

function BoxPlot({ column }) {
  const [plotData, setPlotData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch grouped data for box/violin plots from the backend.
    // Ensure your backend endpoint /box_data returns an array of objects like:
    // [{ region: "Central", malinc: [120, 130, 140] }, ...]
    axios.get(`/box_data?column=${column}&group_by=region`)
      .then(response => {
        const data = response.data;
        // Map each record into a Plotly trace
        const traces = data.map(record => ({
          y: record[column],
          name: record.region,
          type: 'box'
        }));
        setPlotData(traces);
      })
      .catch(err => setError(err.message));
  }, [column]);

  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (plotData.length === 0) return <p>Loading Box Plot...</p>;

  return (
    <div className="plot-container">
      <Plot
        data={plotData}
        layout={{ title: `Box Plot of ${column} by Region` }}
        style={{ width: '100%', height: '400px' }}
      />
    </div>
  );
}

export default BoxPlot;

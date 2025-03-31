// src/components/ViolinPlot.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';

function ViolinPlot({ column }) {
  const [plotData, setPlotData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`/box_data?column=${column}&group_by=region`)
      .then(response => {
        const data = response.data;
        const traces = data.map(record => ({
          y: record[column],
          name: record.region,
          type: 'violin',
          box: { visible: true },
          meanline: { visible: true },
          points: 'all'
        }));
        setPlotData(traces);
      })
      .catch(err => setError(err.message));
  }, [column]);

  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (plotData.length === 0) return <p>Loading Violin Plot...</p>;

  return (
    <div className="plot-container">
      <Plot
        data={plotData}
        layout={{ title: `Violin Plot of ${column} by Region` }}
        style={{ width: '100%', height: '400px' }}
      />
    </div>
  );
}

export default ViolinPlot;

// src/components/HeatmapPlot.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';

function HeatmapPlot({ column }) {
  const [heatmapData, setHeatmapData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`/heatmap_data?column=${column}`)
      .then(response => {
        const { groups, months, matrix } = response.data;
        const trace = {
          x: months.map(m => `Month ${m}`),
          y: groups,
          z: matrix,
          type: 'heatmap',
          colorscale: 'YlOrRd'
        };
        setHeatmapData(trace);
      })
      .catch(err => setError(err.message));
  }, [column]);

  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (!heatmapData) return <p>Loading Heatmap...</p>;

  return (
    <div className="plot-container heatmap-container">
      <Plot
        data={[heatmapData]}
        layout={{
          title: `Heatmap of ${column} by Region & Month`,
          xaxis: { title: 'Month' },
          yaxis: { title: 'Region' }
        }}
        style={{ width: '100%', height: '500px' }}
      />
    </div>
  );
}

export default HeatmapPlot;

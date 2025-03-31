// src/components/TimeSeriesPlot.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';

function TimeSeriesPlot({ column, region, site }) {
  const [plotData, setPlotData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Build base URL for the /data endpoint
    let url = '/data';
    
    // Build a query string if region or site filters are provided
    let params = [];
    if (region) {
      params.push(`region=${encodeURIComponent(region)}`);
    }
    if (site) {
      params.push(`site=${encodeURIComponent(site)}`);
    }
    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    axios.get(url)
      .then(response => {
        const raw = response.data;
        // Filter out records where the chosen column is null
        const filtered = raw.filter(item => item[column] !== null);
        // Create x (dates) and y (values) arrays
        const x = filtered.map(item => item.monthyear);
        const y = filtered.map(item => item[column]);

        setPlotData([
          {
            x: x,
            y: y,
            type: 'scatter',
            mode: 'lines+markers',
            name: column
          }
        ]);
      })
      .catch(err => {
        setError(err.message);
      });
  }, [column, region, site]);

  if (error) return <p style={{color: 'red'}}>Error: {error}</p>;
  if (plotData.length === 0) return <p>Loading Time Series...</p>;

  return (
    <Plot
      data={plotData}
      layout={{ title: `${column} Over Time` }}
      style={{ width: "100%", height: "400px" }}
    />
  );
}

export default TimeSeriesPlot;

// src/components/ForecastPlot.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';

function ForecastPlot({ column, steps }) {
  const [forecastData, setForecastData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`/forecast?column=${column}&steps=${steps}`)
      .then(response => {
        setForecastData(response.data);
      })
      .catch(err => {
        setError(err.message);
      });
  }, [column, steps]);

  if (error) {
    return <p style={{ color: 'red' }}>Error: {error}</p>;
  }
  if (!forecastData) {
    return <p>Loading Forecast...</p>;
  }

  // forecastData.forecast is an object with date keys and forecast values
  const dates = Object.keys(forecastData.forecast);
  const values = Object.values(forecastData.forecast);

  const plotData = [
    {
      x: dates,
      y: values,
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Forecast'
    }
  ];

  return (
    <Plot
      data={plotData}
      layout={{ title: `${column} Forecast for ${steps} Months` }}
      style={{ width: "100%", height: "400px" }}
    />
  );
}

export default ForecastPlot;

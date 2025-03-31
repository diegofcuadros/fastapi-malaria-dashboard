// src/components/SummaryStats.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SummaryStats({ column, region, site }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Start with the required column parameter
    let url = `/summary_stats?column=${column}`;
    
    // If region is provided, add it to the query string
    if (region) {
      url += `&region=${encodeURIComponent(region)}`;
    }
    // If site is provided, add it to the query string
    if (site) {
      url += `&site=${encodeURIComponent(site)}`;
    }
    
    // Fetch the summary statistics from the backend
    axios.get(url)
      .then(response => {
        setStats(response.data);
      })
      .catch(err => {
        setError(err.message);
      });
  }, [column, region, site]);

  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (!stats) return <p>Loading Summary Stats...</p>;
  if (stats.error) return <p style={{ color: 'red' }}>{stats.error}</p>;

  return (
    <div>
      <h3>Summary Statistics for {stats.column}</h3>
      <ul>
        <li>Count: {stats.count}</li>
        <li>Mean: {stats.mean}</li>
        <li>Median: {stats.median}</li>
        <li>Min: {stats.min}</li>
        <li>Max: {stats.max}</li>
        <li>Std: {stats.std}</li>
      </ul>
    </div>
  );
}

export default SummaryStats;

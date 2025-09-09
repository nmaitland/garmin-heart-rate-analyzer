import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { HeartRateData } from '../services/api';

interface HeartRateStatsProps {
  data: HeartRateData[];
}

const HeartRateStats: React.FC<HeartRateStatsProps> = ({ data }) => {
  const calculateStats = () => {
    try {
      if (!Array.isArray(data)) {
        console.warn('Data is not an array for stats calculation:', data);
        return { min: 0, max: 0, avg: 0, error: 'Invalid data format' };
      }

      const validHeartRates = data
        .filter(d => d && typeof d.heartRate === 'number' && !isNaN(d.heartRate) && d.heartRate > 0)
        .map(d => d.heartRate);
      
      if (validHeartRates.length === 0) {
        // Return a special indicator that we should show "No data" message
        return { min: 0, max: 0, avg: 0, error: 'no-valid-data' };
      }

      const min = Math.min(...validHeartRates);
      const max = Math.max(...validHeartRates);
      const avg = Math.round(validHeartRates.reduce((a, b) => a + b, 0) / validHeartRates.length);

      return { min, max, avg, error: null };
    } catch (error) {
      console.error('Error calculating heart rate stats:', error);
      return { min: 0, max: 0, avg: 0, error: 'Failed to calculate statistics' };
    }
  };

  const stats = calculateStats();

  if (stats.error && stats.error !== 'no-valid-data') {
    return (
      <Box data-testid="heart-rate-stats" sx={{ p: 2 }}>
        <Alert severity="error">
          {stats.error}
        </Alert>
      </Box>
    );
  }

  if (!Array.isArray(data) || data.length === 0 || stats.error === 'no-valid-data') {
    return (
      <Box data-testid="heart-rate-stats" sx={{ textAlign: 'center', py: 2 }}>
        <Typography variant="h6" color="textSecondary">
          Heart Rate Statistics
        </Typography>
        <Typography variant="body2" color="textSecondary">
          No data available to calculate statistics
        </Typography>
      </Box>
    );
  }

  return (
    <Box data-testid="heart-rate-stats">
      <Typography variant="h6">Heart Rate Statistics</Typography>
      <Typography>Minimum: {stats.min} bpm</Typography>
      <Typography>Maximum: {stats.max} bpm</Typography>
      <Typography>Average: {stats.avg} bpm</Typography>
    </Box>
  );
};

export default HeartRateStats; 
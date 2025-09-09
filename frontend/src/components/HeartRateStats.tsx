import React from 'react';
import { Box, Typography } from '@mui/material';
import { HeartRateData } from '../services/api';

interface HeartRateStatsProps {
  data: HeartRateData[];
}

const HeartRateStats: React.FC<HeartRateStatsProps> = ({ data }) => {
  const calculateStats = () => {
    if (!data.length) return { min: 0, max: 0, avg: 0 };

    const heartRates = data.map(d => d.heartRate);
    const min = Math.min(...heartRates);
    const max = Math.max(...heartRates);
    const avg = Math.round(heartRates.reduce((a, b) => a + b, 0) / heartRates.length);

    return { min, max, avg };
  };

  const stats = calculateStats();

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
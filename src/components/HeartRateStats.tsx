import React from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';

interface HeartRateStatsProps {
  averageHeartRate: number;
  maxHeartRate: number;
  minHeartRate: number;
}

const HeartRateStats: React.FC<HeartRateStatsProps> = ({
  averageHeartRate,
  maxHeartRate,
  minHeartRate,
}) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Heart Rate Statistics
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant="subtitle1">Average</Typography>
            <Typography variant="h4">{Math.round(averageHeartRate)}</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="subtitle1">Max</Typography>
            <Typography variant="h4">{maxHeartRate}</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="subtitle1">Min</Typography>
            <Typography variant="h4">{minHeartRate}</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default HeartRateStats; 
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, isValid } from 'date-fns';
import { Typography, Box, Alert } from '@mui/material';

interface HeartRateData {
  timestamp: string;
  heartRate: number;
}

interface HeartRateChartProps {
  data: HeartRateData[];
}

const HeartRateChart: React.FC<HeartRateChartProps> = ({ data }) => {
  const formatDate = (date: string) => {
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        console.warn('Invalid date format:', date);
        return 'Invalid';
      }
      return format(parsedDate, 'HH:mm');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid';
    }
  };

  const validateData = (data: HeartRateData[]): HeartRateData[] => {
    if (!Array.isArray(data)) {
      console.warn('Data is not an array:', data);
      return [];
    }

    return data.filter(item => {
      if (!item || typeof item !== 'object') {
        console.warn('Invalid data item:', item);
        return false;
      }
      
      if (!item.timestamp || typeof item.timestamp !== 'string') {
        console.warn('Invalid timestamp:', item.timestamp);
        return false;
      }
      
      // Additional timestamp validation - must be a valid date
      try {
        const parsedDate = new Date(item.timestamp);
        if (isNaN(parsedDate.getTime())) {
          console.warn('Invalid date format:', item.timestamp);
          return false;
        }
      } catch {
        console.warn('Date parsing error:', item.timestamp);
        return false;
      }
      
      if (typeof item.heartRate !== 'number' || isNaN(item.heartRate) || item.heartRate <= 0) {
        console.warn('Invalid heart rate:', item.heartRate);
        return false;
      }
      
      return true;
    });
  };

  const validData = validateData(data);

  if (validData.length === 0) {
    return (
      <Box data-testid="heart-rate-chart" sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="textSecondary">
          No Heart Rate Data Available
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          {data.length > 0 
            ? 'The data contains invalid entries and cannot be displayed.'
            : 'Please fetch heart rate data to see the chart.'}
        </Typography>
      </Box>
    );
  }

  try {
    return (
      <div data-testid="heart-rate-chart">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={validData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatDate}
              interval="preserveStartEnd"
            />
            <YAxis domain={['dataMin - 10', 'dataMax + 10']} />
            <Tooltip
              labelFormatter={(value) => {
                try {
                  const parsedDate = new Date(value);
                  return !isNaN(parsedDate.getTime()) ? format(parsedDate, 'PPpp') : 'Invalid Date';
                } catch {
                  return 'Invalid Date';
                }
              }}
              formatter={(value) => [`${value} bpm`, 'Heart Rate']}
            />
            <Line
              type="monotone"
              dataKey="heartRate"
              stroke="#8884d8"
              dot={false}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  } catch (error) {
    console.error('Error rendering chart:', error);
    return (
      <Box data-testid="heart-rate-chart" sx={{ p: 2 }}>
        <Alert severity="error">
          Failed to render heart rate chart. Please try refreshing the data.
        </Alert>
      </Box>
    );
  }
};

export default HeartRateChart; 
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
import { format } from 'date-fns';

interface HeartRateData {
  timestamp: string;
  heartRate: number;
}

interface HeartRateChartProps {
  data: HeartRateData[];
}

const HeartRateChart: React.FC<HeartRateChartProps> = ({ data }) => {
  const formatDate = (date: string) => {
    return format(new Date(date), 'HH:mm');
  };

  return (
    <div data-testid="heart-rate-chart">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatDate}
            interval="preserveStartEnd"
          />
          <YAxis domain={['dataMin - 10', 'dataMax + 10']} />
          <Tooltip
            labelFormatter={(value) => format(new Date(value), 'PPpp')}
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
};

export default HeartRateChart; 
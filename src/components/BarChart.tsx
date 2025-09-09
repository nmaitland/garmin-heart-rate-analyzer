import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface BarChartProps {
  data: Array<{
    range: string;
    count: number;
  }>;
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="range" />
        <YAxis />
        <Tooltip
          formatter={(value) => [`${value} readings`, 'Count']}
        />
        <Bar dataKey="count" fill="#8884d8" />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default BarChart; 
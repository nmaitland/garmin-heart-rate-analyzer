import React from 'react';
import { render, screen } from '../test-utils';
import '@testing-library/jest-dom';
import HeartRateChart from './HeartRateChart';

// Mock date-fns format function
jest.mock('date-fns', () => ({
  format: jest.fn()
}));

// Mock Recharts components to test more functionality
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="mock-responsive-container">{children}</div>
    ),
    LineChart: ({ children, data }: { children: React.ReactNode; data: any[] }) => (
      <div data-testid="mock-line-chart" data-chart-data={JSON.stringify(data)}>
        {children}
      </div>
    ),
    Line: () => <div data-testid="mock-line" />,
    XAxis: ({ tickFormatter }: { tickFormatter?: (value: any) => string }) => {
      // Test the tickFormatter function
      if (tickFormatter) {
        tickFormatter('2024-01-01T12:30:00Z');
      }
      return <div data-testid="mock-x-axis" />;
    },
    YAxis: () => <div data-testid="mock-y-axis" />,
    CartesianGrid: () => <div data-testid="mock-cartesian-grid" />,
    Tooltip: ({ labelFormatter, formatter }: any) => {
      // Test the tooltip formatters
      if (labelFormatter) {
        labelFormatter('2024-01-01T12:30:00Z');
      }
      if (formatter) {
        formatter(80);
      }
      return <div data-testid="mock-tooltip" />;
    },
  };
});

import { format } from 'date-fns';
const mockFormat = format as jest.MockedFunction<typeof format>;

describe('HeartRateChart', () => {
  beforeEach(() => {
    mockFormat.mockClear();
    mockFormat.mockReturnValue('12:30');
  });

  const mockData = [
    { timestamp: '2024-01-01T00:00:00Z', heartRate: 80 },
    { timestamp: '2024-01-01T01:00:00Z', heartRate: 85 },
    { timestamp: '2024-01-01T02:00:00Z', heartRate: 90 },
  ];

  it('renders chart with data', () => {
    render(<HeartRateChart data={mockData} />);
    
    expect(screen.getByTestId('heart-rate-chart')).toBeInTheDocument();
    expect(screen.getByTestId('mock-line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('mock-line')).toBeInTheDocument();
    expect(screen.getByTestId('mock-x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('mock-y-axis')).toBeInTheDocument();
    expect(screen.getByTestId('mock-cartesian-grid')).toBeInTheDocument();
    expect(screen.getByTestId('mock-tooltip')).toBeInTheDocument();
  });

  it('renders empty state when no data is provided', () => {
    render(<HeartRateChart data={[]} />);
    
    expect(screen.getByTestId('heart-rate-chart')).toBeInTheDocument();
    expect(screen.getByTestId('mock-line-chart')).toBeInTheDocument();
  });

  it('passes correct data to LineChart', () => {
    render(<HeartRateChart data={mockData} />);
    
    const lineChart = screen.getByTestId('mock-line-chart');
    expect(lineChart).toHaveAttribute('data-chart-data', JSON.stringify(mockData));
  });

  it('calls format function for date formatting', () => {
    render(<HeartRateChart data={mockData} />);
    
    // The format function should be called by the XAxis tickFormatter and Tooltip labelFormatter
    expect(mockFormat).toHaveBeenCalled();
  });

  it('handles single data point', () => {
    const singleData = [{ timestamp: '2024-01-01T12:00:00Z', heartRate: 75 }];
    
    render(<HeartRateChart data={singleData} />);
    
    expect(screen.getByTestId('heart-rate-chart')).toBeInTheDocument();
    const lineChart = screen.getByTestId('mock-line-chart');
    expect(lineChart).toHaveAttribute('data-chart-data', JSON.stringify(singleData));
  });
}); 
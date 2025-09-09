import React from 'react';
import { render, screen } from '../test-utils';
import '@testing-library/jest-dom';
import HeartRateStats from './HeartRateStats';
import { HeartRateData } from '../services/api';

describe('HeartRateStats', () => {
  it('renders heart rate statistics with data', () => {
    const mockData: HeartRateData[] = [
      { timestamp: '2024-01-01T00:00:00Z', heartRate: 60 },
      { timestamp: '2024-01-01T01:00:00Z', heartRate: 80 },
      { timestamp: '2024-01-01T02:00:00Z', heartRate: 100 },
    ];

    render(<HeartRateStats data={mockData} />);

    expect(screen.getByTestId('heart-rate-stats')).toBeInTheDocument();
    expect(screen.getByText('Heart Rate Statistics')).toBeInTheDocument();
    expect(screen.getByText('Minimum: 60 bpm')).toBeInTheDocument();
    expect(screen.getByText('Maximum: 100 bpm')).toBeInTheDocument();
    expect(screen.getByText('Average: 80 bpm')).toBeInTheDocument();
  });

  it('renders empty state message when no data is provided', () => {
    render(<HeartRateStats data={[]} />);

    expect(screen.getByTestId('heart-rate-stats')).toBeInTheDocument();
    expect(screen.getByText('Heart Rate Statistics')).toBeInTheDocument();
    expect(screen.getByText(/No data available to calculate statistics/i)).toBeInTheDocument();
  });

  it('calculates correct statistics for single data point', () => {
    const mockData: HeartRateData[] = [
      { timestamp: '2024-01-01T00:00:00Z', heartRate: 75 },
    ];

    render(<HeartRateStats data={mockData} />);

    expect(screen.getByText('Minimum: 75 bpm')).toBeInTheDocument();
    expect(screen.getByText('Maximum: 75 bpm')).toBeInTheDocument();
    expect(screen.getByText('Average: 75 bpm')).toBeInTheDocument();
  });

  it('rounds average to nearest integer', () => {
    const mockData: HeartRateData[] = [
      { timestamp: '2024-01-01T00:00:00Z', heartRate: 70 },
      { timestamp: '2024-01-01T01:00:00Z', heartRate: 71 },
    ];

    render(<HeartRateStats data={mockData} />);

    // Average should be 70.5, rounded to 71
    expect(screen.getByText('Average: 71 bpm')).toBeInTheDocument();
  });

  it('handles large datasets correctly', () => {
    const mockData: HeartRateData[] = Array.from({ length: 1000 }, (_, i) => ({
      timestamp: `2024-01-01T${String(i % 24).padStart(2, '0')}:00:00Z`,
      heartRate: 60 + (i % 40), // Heart rates from 60 to 99
    }));

    render(<HeartRateStats data={mockData} />);

    expect(screen.getByText('Minimum: 60 bpm')).toBeInTheDocument();
    expect(screen.getByText('Maximum: 99 bpm')).toBeInTheDocument();
    // Average should be around 79-80 for this pattern
    expect(screen.getByText(/Average: \d+ bpm/)).toBeInTheDocument();
  });

  it('handles invalid data gracefully', () => {
    const invalidData = [
      { timestamp: '2024-01-01T00:00:00Z', heartRate: 70 },
      { timestamp: '2024-01-01T01:00:00Z', heartRate: -5 }, // Invalid negative
      { timestamp: '2024-01-01T02:00:00Z', heartRate: 'invalid' as any }, // Invalid type
      null as any, // Invalid null
      { timestamp: '2024-01-01T03:00:00Z', heartRate: 90 },
    ];

    render(<HeartRateStats data={invalidData} />);

    expect(screen.getByTestId('heart-rate-stats')).toBeInTheDocument();
    // Should only calculate from valid data points (70 and 90)
    expect(screen.getByText('Minimum: 70 bpm')).toBeInTheDocument();
    expect(screen.getByText('Maximum: 90 bpm')).toBeInTheDocument();
    expect(screen.getByText('Average: 80 bpm')).toBeInTheDocument();
  });

  it('shows error message for completely invalid data', () => {
    const invalidData = [
      { timestamp: '2024-01-01T01:00:00Z', heartRate: -5 },
      { timestamp: '2024-01-01T02:00:00Z', heartRate: 'invalid' as any },
      null as any,
    ];

    render(<HeartRateStats data={invalidData} />);

    expect(screen.getByTestId('heart-rate-stats')).toBeInTheDocument();
    expect(screen.getByText(/No data available to calculate statistics/i)).toBeInTheDocument();
  });
});
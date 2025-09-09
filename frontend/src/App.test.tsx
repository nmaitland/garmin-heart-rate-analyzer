import React from 'react';
import { render, screen } from './test-utils';
import '@testing-library/jest-dom';
import App from './App';

// Mock the API module
jest.mock('./services/api', () => ({
  fetchHeartRateData: jest.fn().mockResolvedValue([
    { timestamp: '2024-01-01T00:00:00Z', heartRate: 80 },
    { timestamp: '2024-01-01T01:00:00Z', heartRate: 85 },
  ]),
}));


describe('App', () => {
  it('renders the dashboard', () => {
    render(<App />);
    expect(screen.getByText(/Garmin Heart Rate Analyzer/i)).toBeInTheDocument();
  });
}); 
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '../test-utils';
import '@testing-library/jest-dom';
import Dashboard from './Dashboard';
import axios from 'axios';

// Mock the API module
jest.mock('../services/api', () => ({
  fetchHeartRateData: jest.fn(),
}));

// Mock the chart components
jest.mock('./HeartRateChart', () => () => <div data-testid="heart-rate-chart" />);

// Mock axios for direct Dashboard usage
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up default mocks for both API calls
    mockedAxios.get
      .mockResolvedValueOnce({
        data: [
          { timestamp: '2024-01-01T00:00:00Z', heartRate: 80 },
          { timestamp: '2024-01-01T01:00:00Z', heartRate: 85 },
        ]
      })
      .mockResolvedValueOnce({
        data: 82.5
      });
  });

  it('renders dashboard title', () => {
    render(<Dashboard />);
    expect(screen.getByText(/Garmin Heart Rate Analyzer/i)).toBeInTheDocument();
  });

  it('renders user input fields', () => {
    render(<Dashboard />);
    expect(screen.getByLabelText(/User ID/i)).toBeInTheDocument();
    expect(screen.getByTestId('date-picker-start-date')).toBeInTheDocument();
    expect(screen.getByTestId('date-picker-end-date')).toBeInTheDocument();
  });

  it('renders chart components', () => {
    render(<Dashboard />);
    expect(screen.getByTestId('heart-rate-chart')).toBeInTheDocument();
  });

  it('updates user ID when input changes', () => {
    render(<Dashboard />);
    const userIdInput = screen.getByLabelText(/User ID/i);
    
    fireEvent.change(userIdInput, { target: { value: 'test-user-123' } });
    
    expect(userIdInput).toHaveValue('test-user-123');
  });

  it('enables fetch button when user ID is provided', async () => {
    // Clear the default mocks and set up fresh ones
    mockedAxios.get.mockClear();
    mockedAxios.get
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: 0 });
    
    render(<Dashboard />);
    const userIdInput = screen.getByLabelText(/User ID/i);
    
    // Wait for initial render to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    const fetchButton = screen.getByText(/Fetch Heart Rate Data/i);
    expect(fetchButton).toBeDisabled();
    
    await act(async () => {
      fireEvent.change(userIdInput, { target: { value: 'test-user' } });
    });
    
    await waitFor(() => {
      expect(fetchButton).toBeEnabled();
    });
  });

  it('fetches heart rate data when button is clicked', async () => {
    // Clear the default mocks and set up specific mocks for this test
    mockedAxios.get.mockClear();
    mockedAxios.get
      .mockResolvedValueOnce({ data: [] })  // Initial useEffect call - heart rate data
      .mockResolvedValueOnce({ data: 0 })   // Initial useEffect call - average
      .mockResolvedValueOnce({ data: [{ timestamp: '2024-01-01T00:00:00Z', heartRate: 80 }] })  // Button click - heart rate data
      .mockResolvedValueOnce({ data: 80.0 }); // Button click - average

    render(<Dashboard />);
    const userIdInput = screen.getByLabelText(/User ID/i);
    
    // Wait for initial useEffect calls to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    const fetchButton = screen.getByText(/Fetch Heart Rate Data/i);
    
    await act(async () => {
      fireEvent.change(userIdInput, { target: { value: 'test-user' } });
    });
    
    await waitFor(() => {
      expect(fetchButton).toBeEnabled();
    });
    
    await act(async () => {
      fireEvent.click(fetchButton);
    });
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledTimes(4); // 2 initial + 2 from button click
    });
  });

  it('displays loading state during data fetch', async () => {
    // Skip the initial useEffect by not providing userId initially
    mockedAxios.get.mockClear();
    
    render(<Dashboard />);
    
    const userIdInput = screen.getByLabelText(/User ID/i);
    const fetchButton = screen.getByText(/Fetch Heart Rate Data/i);
    
    // Initially the button should be disabled because no userId
    expect(fetchButton).toBeDisabled();
    
    // Set up a slow promise for the fetch operation
    let resolveFetchPromise: any;
    let resolveAvgPromise: any;
    const slowFetchPromise = new Promise(resolve => { resolveFetchPromise = resolve; });
    const slowAvgPromise = new Promise(resolve => { resolveAvgPromise = resolve; });
    
    mockedAxios.get
      .mockReturnValueOnce(slowFetchPromise)  // Heart rate data fetch
      .mockReturnValueOnce(slowAvgPromise);   // Average fetch
    
    await act(async () => {
      fireEvent.change(userIdInput, { target: { value: 'test-user' } });
    });
    
    await waitFor(() => {
      expect(fetchButton).toBeEnabled();
    });
    
    // Click the button to start the fetch
    fireEvent.click(fetchButton);
    
    // Immediately after click, button should be disabled (loading state)
    await waitFor(() => {
      expect(fetchButton).toBeDisabled();
    });
    
    // Resolve the promises to finish loading
    await act(async () => {
      resolveFetchPromise({ data: [] });
      resolveAvgPromise({ data: 0 });
    });
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(fetchButton).toBeEnabled();
    });
  });

  it('handles API errors gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Clear all mocks and set up fresh state
    mockedAxios.get.mockClear();
    mockedAxios.get.mockReset();
    
    await act(async () => {
      render(<Dashboard />);
    });
    
    const userIdInput = screen.getByLabelText(/User ID/i);
    const fetchButton = screen.getByText(/Fetch Heart Rate Data/i);
    
    // Set up rejection for both API calls that happen when userId is set and button is clicked
    mockedAxios.get
      .mockRejectedValueOnce(new Error('API Error'))  // Heart rate data call
      .mockRejectedValueOnce(new Error('API Error')); // Average call
    
    await act(async () => {
      fireEvent.change(userIdInput, { target: { value: 'test-user' } });
    });
    
    await waitFor(() => {
      expect(fetchButton).toBeEnabled();
    });
    
    await act(async () => {
      fireEvent.click(fetchButton);
    });
    
    // Wait for the error to be processed and displayed
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch heart rate data/i)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    consoleError.mockRestore();
  });

  it('calculates average heart rate correctly', async () => {
    // Clear all mocks including beforeEach setup
    jest.clearAllMocks();
    mockedAxios.get.mockClear();
    mockedAxios.get.mockReset();
    
    // Set up fresh mocks BEFORE rendering - need 4 calls total
    // 2 for initial useEffect when userId is set, then 2 for button click
    mockedAxios.get
      .mockResolvedValueOnce({ data: [] })  // Initial empty data
      .mockResolvedValueOnce({ data: 0 })   // Initial zero average
      .mockResolvedValueOnce({ 
        data: [
          { timestamp: '2024-01-01T00:00:00Z', heartRate: 70 },
          { timestamp: '2024-01-01T01:00:00Z', heartRate: 80 },
          { timestamp: '2024-01-01T02:00:00Z', heartRate: 90 },
        ]
      })
      .mockResolvedValueOnce({ data: 80 });
    
    await act(async () => {
      render(<Dashboard />);
    });
    
    const userIdInput = screen.getByLabelText(/User ID/i);
    const fetchButton = screen.getByText(/Fetch Heart Rate Data/i);
    
    await act(async () => {
      fireEvent.change(userIdInput, { target: { value: 'test-user' } });
    });
    
    // Wait for the useEffect to complete after userId change
    await waitFor(() => {
      expect(fetchButton).toBeEnabled();
    });
    
    await act(async () => {
      fireEvent.click(fetchButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Average Heart Rate: 80.0 bpm/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('shows zero average when no data is available', async () => {
    // Clear default mocks and set up empty data scenario
    mockedAxios.get.mockClear();
    mockedAxios.get
      .mockResolvedValueOnce({ data: [] })  // Initial useEffect call - heart rate data
      .mockResolvedValueOnce({ data: 0 });  // Initial useEffect call - average
    
    render(<Dashboard />);
    
    // Wait for initial render and axios calls
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Average Heart Rate: 0.0 bpm/i)).toBeInTheDocument();
    });
  });

  it('updates date range when date pickers change', async () => {
    render(<Dashboard />);
    const startDatePicker = screen.getByTestId('date-picker-start-date');
    const endDatePicker = screen.getByTestId('date-picker-end-date');
    
    fireEvent.change(startDatePicker, { target: { value: '2024-01-15' } });
    fireEvent.change(endDatePicker, { target: { value: '2024-01-16' } });
    
    expect(startDatePicker).toHaveValue('2024-01-15');
    expect(endDatePicker).toHaveValue('2024-01-16');
  });
}); 
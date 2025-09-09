import axios from 'axios';
import { syncGarminData, getGarminHeartRate } from './garmin.service';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock console methods to avoid noise during tests
const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('Garmin Service', () => {
  const mockBaseUrl = 'http://localhost:3001';
  
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.REACT_APP_API_URL = mockBaseUrl;
  });

  afterEach(() => {
    consoleSpy.mockClear();
  });

  describe('syncGarminData', () => {
    const userId = 'user123';
    const startDate = new Date('2024-01-01T00:00:00.000Z');
    const endDate = new Date('2024-01-02T00:00:00.000Z');

    it('should sync Garmin data successfully', async () => {
      const mockResponse = { success: true, message: 'Data synced' };
      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await syncGarminData(userId, startDate, endDate);

      expect(mockedAxios.post).toHaveBeenCalledWith(`${mockBaseUrl}/garmin/sync`, {
        userId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors and log them', async () => {
      const error = new Error('Network Error');
      mockedAxios.post.mockRejectedValueOnce(error);

      await expect(syncGarminData(userId, startDate, endDate)).rejects.toThrow('Network Error');

      expect(consoleSpy).toHaveBeenCalledWith('Error syncing Garmin data:', error);
    });

    it('should use default API URL when REACT_APP_API_URL is not set', async () => {
      delete process.env.REACT_APP_API_URL;
      const mockResponse = { success: true };
      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

      await syncGarminData(userId, startDate, endDate);

      expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:3001/garmin/sync', {
        userId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
    });
  });

  describe('getGarminHeartRate', () => {
    const startDate = new Date('2024-01-01T00:00:00.000Z');
    const endDate = new Date('2024-01-02T00:00:00.000Z');

    it('should fetch Garmin heart rate data successfully', async () => {
      const mockData = [
        { timestamp: '2024-01-01T00:00:00Z', heartRate: 75 },
        { timestamp: '2024-01-01T01:00:00Z', heartRate: 80 },
      ];
      mockedAxios.get.mockResolvedValueOnce({ data: mockData });

      const result = await getGarminHeartRate(startDate, endDate);

      expect(mockedAxios.get).toHaveBeenCalledWith(`${mockBaseUrl}/garmin/heart-rate`, {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });

      expect(result).toEqual(mockData);
    });

    it('should handle API errors and log them', async () => {
      const error = new Error('API Error');
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(getGarminHeartRate(startDate, endDate)).rejects.toThrow('API Error');

      expect(consoleSpy).toHaveBeenCalledWith('Error fetching Garmin heart rate data:', error);
    });

    it('should handle empty response', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] });

      const result = await getGarminHeartRate(startDate, endDate);

      expect(result).toEqual([]);
    });
  });
});
import axios from 'axios';
import { fetchHeartRateData } from './api';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchHeartRateData', () => {
    it('should fetch heart rate data successfully', async () => {
      const mockData = [
        { timestamp: '2024-01-01T00:00:00Z', heartRate: 80 },
        { timestamp: '2024-01-01T01:00:00Z', heartRate: 85 },
      ];

      mockedAxios.get.mockResolvedValueOnce({
        data: { heartRateData: mockData }
      });

      const result = await fetchHeartRateData('user123', '2024-01-01', '2024-01-02');

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/heart-rate', {
        params: {
          userId: 'user123',
          startDate: '2024-01-01',
          endDate: '2024-01-02'
        },
        timeout: 30000
      });

      expect(result).toEqual(mockData);
    });

    it('should handle API errors', async () => {
      const errorMessage = 'Network Error';
      mockedAxios.get.mockRejectedValueOnce(new Error(errorMessage));

      await expect(
        fetchHeartRateData('user123', '2024-01-01', '2024-01-02')
      ).rejects.toMatchObject({
        message: errorMessage
      });

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/heart-rate', {
        params: {
          userId: 'user123',
          startDate: '2024-01-01',
          endDate: '2024-01-02'
        },
        timeout: 30000
      });
    });

    it('should handle empty response data', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { heartRateData: [] }
      });

      const result = await fetchHeartRateData('user123', '2024-01-01', '2024-01-02');

      expect(result).toEqual([]);
    });
  });
});
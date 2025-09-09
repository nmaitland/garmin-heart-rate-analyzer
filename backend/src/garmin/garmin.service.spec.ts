import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { HeartRateService } from '../heart-rate/heart-rate.service';
import { GarminService } from './garmin.service';

// Mock garmin-connect module
jest.mock('garmin-connect', () => {
  const mockGarminClient = {
    login: jest.fn().mockResolvedValue(undefined),
    getHeartRate: jest.fn().mockResolvedValue({
      heartRateValues: [
        { timestamp: '2024-01-01T00:00:00.000Z', heartRate: 80 },
        { timestamp: '2024-01-01T01:00:00.000Z', heartRate: 85 },
      ],
    }),
  };

  return {
    GarminConnect: jest.fn().mockImplementation(() => mockGarminClient),
    __mockGarminClient: mockGarminClient, // Export for test access
  };
});

// Get access to the mocked client
const mockGarminConnect = require('garmin-connect');
const mockGarminClient = mockGarminConnect.__mockGarminClient;

describe('GarminService', () => {
  let service: GarminService;

  const mockConfig = {
    get: jest.fn().mockImplementation((key: string): string => {
      const config: Record<string, string> = {
        'garmin.username': 'test_user',
        'garmin.password': 'test_password',
      };
      return config[key] || '';
    }),
  };

  const mockHeartRateService = {
    create: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GarminService,
        { provide: ConfigService, useValue: mockConfig },
        { provide: HeartRateService, useValue: mockHeartRateService },
      ],
    }).compile();

    service = module.get(GarminService);
    jest.clearAllMocks();
    
    // Reset mock config to default values
    mockConfig.get.mockImplementation((key: string): string => {
      const config: Record<string, string> = {
        'garmin.username': 'test_user',
        'garmin.password': 'test_password',
      };
      return config[key] || '';
    });
    
    // Reset mock garmin client to default behavior
    mockGarminClient.login.mockResolvedValue(undefined);
    mockGarminClient.getHeartRate.mockResolvedValue({
      heartRateValues: [
        { timestamp: '2024-01-01T00:00:00.000Z', heartRate: 80 },
        { timestamp: '2024-01-01T01:00:00.000Z', heartRate: 85 },
      ],
    });
  });

  describe('onModuleInit', () => {
    it('should initialize Garmin client with credentials', async () => {
      await expect(service.onModuleInit()).resolves.not.toThrow();
      expect(mockGarminClient.login).toHaveBeenCalled();
    });

    it('should throw error if username is missing', async () => {
      mockConfig.get.mockImplementation((key: string) => {
        if (key === 'garmin.username') return '';
        if (key === 'garmin.password') return 'test_password';
        return '';
      });
      await expect(service.onModuleInit()).rejects.toThrow(
        'Garmin credentials not configured',
      );
    });

    it('should throw error if password is missing', async () => {
      mockConfig.get.mockImplementation((key: string) => {
        if (key === 'garmin.username') return 'test_user';
        if (key === 'garmin.password') return '';
        return '';
      });
      await expect(service.onModuleInit()).rejects.toThrow(
        'Garmin credentials not configured',
      );
    });

    it('should handle login errors', async () => {
      mockGarminClient.login.mockRejectedValueOnce(new Error('Login failed'));
      await expect(service.onModuleInit()).rejects.toThrow('Login failed');
    });
  });

  describe('syncHeartRateData', () => {
    const testParams = {
      userId: 'test-user',
      startDate: new Date('2024-01-01T00:00:00.000Z'),
      endDate: new Date('2024-01-01T23:59:59.999Z'), // Full day range
    };

    it('should sync heart rate data for date range', async () => {
      await service.onModuleInit(); // Initialize service first
      
      // Reset mock to return the expected data
      mockGarminClient.getHeartRate.mockResolvedValue({
        heartRateValues: [
          { timestamp: '2024-01-01T00:00:00.000Z', heartRate: 80 },
          { timestamp: '2024-01-01T01:00:00.000Z', heartRate: 85 },
        ],
      });
      
      const result = await service.syncHeartRateData(
        testParams.userId,
        testParams.startDate,
        testParams.endDate,
      );

      expect(result.success).toBe(true);
      expect(result.syncedCount).toBe(2); // Should process 2 valid heart rate values
      expect(mockGarminClient.getHeartRate).toHaveBeenCalled();
      expect(mockHeartRateService.create).toHaveBeenCalledTimes(2);
    });

    it('should handle invalid heart rate values', async () => {
      await service.onModuleInit(); // Initialize service first
      
      const invalidData = {
        heartRateValues: [
          { timestamp: '2024-01-01T00:00:00.000Z', heartRate: 'invalid' },
          { timestamp: '2024-01-01T01:00:00.000Z' },
        ],
      };
      mockGarminClient.getHeartRate.mockResolvedValueOnce(invalidData);

      const result = await service.syncHeartRateData(
        testParams.userId,
        testParams.startDate,
        testParams.endDate,
      );

      expect(result.success).toBe(true);
      expect(result.syncedCount).toBe(0);
    });

    it('should handle empty data response', async () => {
      await service.onModuleInit(); // Initialize service first
      
      mockGarminClient.getHeartRate.mockResolvedValueOnce({
        heartRateValues: [],
      });

      const result = await service.syncHeartRateData(
        testParams.userId,
        testParams.startDate,
        testParams.endDate,
      );

      expect(result.success).toBe(true);
      expect(result.syncedCount).toBe(0);
    });

    it('should handle API errors gracefully', async () => {
      await service.onModuleInit(); // Initialize service first
      
      mockGarminClient.getHeartRate.mockRejectedValue(
        new Error('API Error'),
      );

      // The service should handle API errors gracefully and return success: true with syncedCount: 0
      const result = await service.syncHeartRateData(
        testParams.userId,
        testParams.startDate,
        testParams.endDate,
      );

      expect(result.success).toBe(true);
      expect(result.syncedCount).toBe(0);
    });
  });

  describe('getHeartRateData', () => {
    const startDate = new Date('2024-01-01T00:00:00.000Z');
    const endDate = new Date('2024-01-01T23:59:59.999Z'); // Full day range

    it('should fetch heart rate data', async () => {
      await service.onModuleInit(); // Initialize service first
      
      // Reset mock to return the expected data
      mockGarminClient.getHeartRate.mockResolvedValue({
        heartRateValues: [
          { timestamp: '2024-01-01T00:00:00.000Z', heartRate: 80 },
          { timestamp: '2024-01-01T01:00:00.000Z', heartRate: 85 },
        ],
      });
      
      const result = await service.getHeartRateData(startDate, endDate);

      expect(result).toEqual({
        heartRateValues: [
          { timestamp: '2024-01-01T00:00:00.000Z', heartRate: 80 },
          { timestamp: '2024-01-01T01:00:00.000Z', heartRate: 85 },
        ],
      });
      expect(mockGarminClient.getHeartRate).toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      await service.onModuleInit(); // Initialize service first
      
      mockGarminClient.getHeartRate.mockRejectedValue(
        new Error('API Error'),
      );

      // The service should handle API errors gracefully and return empty data
      const result = await service.getHeartRateData(startDate, endDate);
      
      expect(result).toEqual({
        heartRateValues: [],
      });
    });
  });
});

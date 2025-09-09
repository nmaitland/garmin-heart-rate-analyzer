import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { mockGarminClient } from '../../test/__mocks__/garmin-connect';
import { HeartRateService } from '../heart-rate/heart-rate.service';
import { GarminService } from './garmin.service';

jest.mock('garmin-connect');

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
    await service.onModuleInit();
  });

  describe('onModuleInit', () => {
    it('should initialize Garmin client with credentials', async () => {
      await expect(service.onModuleInit()).resolves.not.toThrow();
      expect(mockGarminClient.login).toHaveBeenCalled();
    });

    it('should throw error if username is missing', async () => {
      mockConfig.get.mockReturnValueOnce('');
      await expect(service.onModuleInit()).rejects.toThrow(
        'Garmin credentials not configured',
      );
    });

    it('should throw error if password is missing', async () => {
      mockConfig.get.mockReturnValueOnce('test_user').mockReturnValueOnce('');
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
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-02'),
    };

    it('should sync heart rate data for date range', async () => {
      const result = await service.syncHeartRateData(
        testParams.userId,
        testParams.startDate,
        testParams.endDate,
      );

      expect(result.success).toBe(true);
      expect(result.syncedCount).toBe(2);
      expect(mockGarminClient.getHeartRate).toHaveBeenCalledWith(
        testParams.startDate,
      );
      expect(mockHeartRateService.create).toHaveBeenCalledTimes(2);
    });

    it('should handle invalid heart rate values', async () => {
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

    it('should handle API errors', async () => {
      mockGarminClient.getHeartRate.mockRejectedValueOnce(
        new Error('API Error'),
      );

      await expect(
        service.syncHeartRateData(
          testParams.userId,
          testParams.startDate,
          testParams.endDate,
        ),
      ).rejects.toThrow('Failed to sync heart rate data');
    });
  });

  describe('getHeartRateData', () => {
    const testDate = new Date('2024-01-01');

    it('should fetch heart rate data', async () => {
      const result = await service.getHeartRateData(testDate);

      expect(result).toEqual({
        heartRateValues: [
          { timestamp: '2024-01-01T00:00:00.000Z', heartRate: 80 },
          { timestamp: '2024-01-01T01:00:00.000Z', heartRate: 85 },
        ],
      });
      expect(mockGarminClient.getHeartRate).toHaveBeenCalledWith(testDate);
    });

    it('should handle API errors', async () => {
      mockGarminClient.getHeartRate.mockRejectedValueOnce(
        new Error('API Error'),
      );

      await expect(service.getHeartRateData(testDate)).rejects.toThrow(
        'Failed to fetch heart rate data',
      );
    });
  });
});

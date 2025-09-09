import { Test, TestingModule } from '@nestjs/testing';
import { mockHeartRateData } from '../../test/__mocks__/heart-rate.mock';
import { HeartRateController } from './heart-rate.controller';
import { HeartRateService } from './heart-rate.service';

describe('HeartRateController', () => {
  let controller: HeartRateController;

  const mockHeartRateService = {
    create: jest.fn().mockResolvedValue(mockHeartRateData),
    findByTimeRange: jest.fn().mockResolvedValue([mockHeartRateData]),
    getAverageHeartRate: jest.fn().mockResolvedValue(80),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HeartRateController],
      providers: [
        {
          provide: HeartRateService,
          useValue: mockHeartRateService,
        },
      ],
    }).compile();

    controller = module.get<HeartRateController>(HeartRateController);
    jest.clearAllMocks();
  });

  describe('create', () => {
    const heartRateData = {
      userId: 'test-user',
      timestamp: new Date('2024-01-01T00:00:00.000Z'),
      heartRate: 80,
    };

    it('should create a heart rate record', async () => {
      const result = await controller.create(heartRateData);

      expect(result).toEqual(mockHeartRateData);
      expect(mockHeartRateService.create).toHaveBeenCalledWith(heartRateData);
    });

    it('should handle creation errors', async () => {
      const error = new Error('Service error');
      mockHeartRateService.create.mockRejectedValueOnce(error);

      await expect(controller.create(heartRateData)).rejects.toThrow(error);
    });
  });

  describe('findByTimeRange', () => {
    const params = {
      userId: 'test-user',
      startDate: '2024-01-01',
      endDate: '2024-01-02',
    };

    it('should return heart rate data for time range', async () => {
      const result = await controller.findByTimeRange(
        params.userId,
        params.startDate,
        params.endDate,
      );

      expect(result).toEqual([mockHeartRateData]);
      expect(mockHeartRateService.findByTimeRange).toHaveBeenCalledWith(
        params.userId,
        new Date(params.startDate),
        new Date(params.endDate),
      );
    });

    it('should handle empty results', async () => {
      mockHeartRateService.findByTimeRange.mockResolvedValueOnce([]);

      const result = await controller.findByTimeRange(
        params.userId,
        params.startDate,
        params.endDate,
      );

      expect(result).toEqual([]);
    });

    it('should handle query errors', async () => {
      const error = new Error('Service error');
      mockHeartRateService.findByTimeRange.mockRejectedValueOnce(error);

      await expect(
        controller.findByTimeRange(
          params.userId,
          params.startDate,
          params.endDate,
        ),
      ).rejects.toThrow(error);
    });
  });

  describe('getAverageHeartRate', () => {
    const params = {
      userId: 'test-user',
      startDate: '2024-01-01',
      endDate: '2024-01-02',
    };

    it('should return average heart rate', async () => {
      const result = await controller.getAverageHeartRate(
        params.userId,
        params.startDate,
        params.endDate,
      );

      expect(result).toBe(80);
      expect(mockHeartRateService.getAverageHeartRate).toHaveBeenCalledWith(
        params.userId,
        new Date(params.startDate),
        new Date(params.endDate),
      );
    });

    it('should handle query errors', async () => {
      const error = new Error('Service error');
      mockHeartRateService.getAverageHeartRate.mockRejectedValueOnce(error);

      await expect(
        controller.getAverageHeartRate(
          params.userId,
          params.startDate,
          params.endDate,
        ),
      ).rejects.toThrow(error);
    });
  });
});

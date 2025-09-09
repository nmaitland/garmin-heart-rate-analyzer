import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  mockHeartRateData,
  mockHeartRateRepository,
} from '../../test/__mocks__/heart-rate.mock';
import { HeartRate } from './entities/heart-rate.entity';
import { HeartRateService } from './heart-rate.service';

describe('HeartRateService', () => {
  let service: HeartRateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HeartRateService,
        {
          provide: getRepositoryToken(HeartRate),
          useValue: mockHeartRateRepository,
        },
      ],
    }).compile();

    service = module.get<HeartRateService>(HeartRateService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new heart rate record', async () => {
      const heartRateData = {
        userId: 'test-user',
        timestamp: new Date('2024-01-01T00:00:00.000Z'),
        heartRate: 80,
      };
      const result = await service.create(heartRateData);
      expect(mockHeartRateRepository.create).toHaveBeenCalledWith(
        heartRateData,
      );
      expect(mockHeartRateRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockHeartRateData);
    });

    it('should handle create errors', async () => {
      const error = new Error('Database error');
      mockHeartRateRepository.save.mockRejectedValueOnce(error);
      await expect(service.create(mockHeartRateData)).rejects.toThrow(error);
    });
  });

  describe('findByTimeRange', () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-02');
    const userId = 'test-user';

    it('should find heart rate records within time range', async () => {
      const result = await service.findByTimeRange(userId, startDate, endDate);
      expect(mockHeartRateRepository.find).toHaveBeenCalledWith({
        where: {
          userId,
          timestamp: expect.objectContaining({
            _type: 'between',
            _value: [startDate, endDate],
          }),
        },
        order: {
          timestamp: 'ASC',
        },
      });
      expect(result).toEqual([mockHeartRateData]);
    });

    it('should handle empty results', async () => {
      mockHeartRateRepository.find.mockResolvedValueOnce([]);
      const result = await service.findByTimeRange(userId, startDate, endDate);
      expect(result).toEqual([]);
    });

    it('should handle query errors', async () => {
      const error = new Error('Database error');
      mockHeartRateRepository.find.mockRejectedValueOnce(error);
      await expect(
        service.findByTimeRange(userId, startDate, endDate),
      ).rejects.toThrow(error);
    });
  });

  describe('getAverageHeartRate', () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-02');
    const userId = 'test-user';

    it('should calculate average heart rate for time range', async () => {
      const result = await service.getAverageHeartRate(
        userId,
        startDate,
        endDate,
      );
      expect(mockHeartRateRepository.createQueryBuilder).toHaveBeenCalled();
      expect(result).toBe(80);
    });

    it('should return 0 when no data found', async () => {
      mockHeartRateRepository.createQueryBuilder.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ average: null }),
      }));
      const result = await service.getAverageHeartRate(
        userId,
        startDate,
        endDate,
      );
      expect(result).toBe(0);
    });

    it('should handle query errors', async () => {
      const error = new Error('Database error');
      mockHeartRateRepository.createQueryBuilder.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockRejectedValue(error),
      }));
      await expect(
        service.getAverageHeartRate(userId, startDate, endDate),
      ).rejects.toThrow(error);
    });
  });
});

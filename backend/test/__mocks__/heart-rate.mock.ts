export const mockHeartRateData = {
  id: '1',
  userId: 'test-user',
  timestamp: new Date('2024-01-01T00:00:00.000Z'),
  heartRate: 80,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
};

export const mockHeartRateRepository = {
  create: jest.fn().mockReturnValue(mockHeartRateData),
  save: jest.fn().mockResolvedValue(mockHeartRateData),
  find: jest.fn().mockResolvedValue([mockHeartRateData]),
  createQueryBuilder: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getRawOne: jest.fn().mockResolvedValue({ average: 80 }),
  })),
};

interface HeartRateResponse {
  heartRateValues: Array<{
    timestamp: string;
    heartRate: number;
  }>;
}

const mockHeartRateData: HeartRateResponse = {
  heartRateValues: [
    { timestamp: '2024-01-01T00:00:00.000Z', heartRate: 80 },
    { timestamp: '2024-01-01T01:00:00.000Z', heartRate: 85 },
  ],
};

export const mockGarminClient = {
  login: jest.fn().mockResolvedValue(undefined),
  getHeartRate: jest.fn().mockResolvedValue(mockHeartRateData),
};

export const GarminConnect = jest
  .fn()
  .mockImplementation(() => mockGarminClient);

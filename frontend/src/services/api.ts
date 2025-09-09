import axios from 'axios';

export interface HeartRateData {
  timestamp: string;
  heartRate: number;
}

export const fetchHeartRateData = async (userId: string, startDate: string, endDate: string): Promise<HeartRateData[]> => {
  const response = await axios.get(`/api/heart-rate`, {
    params: {
      userId,
      startDate,
      endDate,
    },
  });
  return response.data.heartRateData;
}; 
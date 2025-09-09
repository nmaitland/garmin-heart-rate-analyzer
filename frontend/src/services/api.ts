import axios, { AxiosError } from 'axios';

export interface HeartRateData {
  timestamp: string;
  heartRate: number;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export const createApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      message: axiosError.response?.data?.message || axiosError.message || 'API request failed',
      status: axiosError.response?.status,
      code: axiosError.code,
    };
  }
  
  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }
  
  return {
    message: 'An unknown error occurred',
  };
};

export const fetchHeartRateData = async (
  userId: string, 
  startDate: string, 
  endDate: string
): Promise<HeartRateData[]> => {
  try {
    if (!userId || !startDate || !endDate) {
      throw new Error('Missing required parameters: userId, startDate, and endDate are required');
    }

    const response = await axios.get(`/api/heart-rate`, {
      params: {
        userId,
        startDate,
        endDate,
      },
      timeout: 30000,
    });

    if (!response.data) {
      throw new Error('No data received from server');
    }

    const heartRateData = response.data.heartRateData || response.data;
    
    if (!Array.isArray(heartRateData)) {
      throw new Error('Invalid data format: expected array of heart rate data');
    }

    return heartRateData.map((item, index) => {
      if (!item || typeof item !== 'object') {
        throw new Error(`Invalid data item at index ${index}: expected object`);
      }
      
      if (!item.timestamp || typeof item.timestamp !== 'string') {
        throw new Error(`Invalid timestamp at index ${index}: expected string`);
      }
      
      if (typeof item.heartRate !== 'number' || isNaN(item.heartRate)) {
        throw new Error(`Invalid heart rate at index ${index}: expected number`);
      }
      
      return {
        timestamp: item.timestamp,
        heartRate: item.heartRate,
      };
    });
  } catch (error) {
    console.error('Error fetching heart rate data:', error);
    throw createApiError(error);
  }
}; 
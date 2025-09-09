import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export interface HeartRateData {
  timestamp: string;
  heartRate: number;
}

export const syncGarminData = async (
  userId: string,
  startDate: Date,
  endDate: Date,
) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/garmin/sync`, {
      userId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
    return response.data;
  } catch (error) {
    console.error('Error syncing Garmin data:', error);
    throw error;
  }
};

export const getGarminHeartRate = async (startDate: Date, endDate: Date) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/garmin/heart-rate`, {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching Garmin heart rate data:', error);
    throw error;
  }
}; 
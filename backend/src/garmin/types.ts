export interface HeartRateDataPoint {
  timestamp: string;
  heartRate: number;
}

export interface HeartRateResponse {
  heartRateValues: HeartRateDataPoint[];
}

export type SyncResponse = {
  success: boolean;
  message: string;
  syncedCount: number;
};

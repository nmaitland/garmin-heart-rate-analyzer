import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GarminConnect } from 'garmin-connect';
import { HeartRateService } from '../heart-rate/heart-rate.service';
import { HeartRateDataPoint, HeartRateResponse, SyncResponse } from './types';

@Injectable()
export class GarminService implements OnModuleInit {
  private readonly logger = new Logger(GarminService.name);
  private garminClient!: GarminConnect;

  constructor(
    private configService: ConfigService,
    private heartRateService: HeartRateService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.logger.log('🔧 Initializing Garmin service...');
    const username = this.configService.get<string>('garmin.username');
    const password = this.configService.get<string>('garmin.password');

    this.logger.log(`👤 Garmin username configured: ${username ? 'YES' : 'NO'}`);
    this.logger.log(`🔑 Garmin password configured: ${password ? 'YES' : 'NO'}`);

    if (!username || !password) {
      this.logger.error('❌ Garmin credentials not configured');
      throw new Error('Garmin credentials not configured');
    }

    try {
      this.logger.log('🔐 Creating Garmin Connect client...');
      this.garminClient = new GarminConnect({ username, password });
      
      this.logger.log('🚪 Attempting Garmin Connect login...');
      await this.garminClient.login();
      this.logger.log('✅ Successfully logged into Garmin Connect');
    } catch (error) {
      this.logger.error('❌ Failed to login to Garmin Connect:', error);
      throw error;
    }
  }

  async syncHeartRateData(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<SyncResponse> {
    this.logger.log('🔄 Starting heart rate data sync...');
    this.logger.log(`📋 Sync parameters: userId=${userId}, startDate=${startDate.toISOString()}, endDate=${endDate.toISOString()}`);

    try {
      const currentDate = new Date(startDate);
      let syncedCount = 0;
      let totalDaysProcessed = 0;

      this.logger.log('📅 Beginning day-by-day data fetching...');

      while (currentDate <= endDate) {
        totalDaysProcessed++;
        this.logger.log(`📍 Processing day ${totalDaysProcessed}: ${currentDate.toISOString().split('T')[0]}`);

        try {
          this.logger.log('🌐 Calling Garmin Connect API for heart rate data...');
          const data = (await this.garminClient.getHeartRate(
            currentDate,
          )) as HeartRateResponse;

          this.logger.log(`📊 Garmin API response: ${data ? 'Data received' : 'No data'}`);
          this.logger.log(`💓 Heart rate values count: ${data?.heartRateValues?.length || 0}`);

          if (data?.heartRateValues?.length) {
            let dayValidCount = 0;
            let invalidDataCount = 0;
            let outOfRangeCount = 0;
            
            this.logger.log(`🔍 Processing ${data.heartRateValues.length} heart rate values...`);
            
            for (const rawDataPoint of data.heartRateValues) {
              if (this.isValidHeartRateDataPoint(rawDataPoint)) {
                const parsedDataPoint = this.parseHeartRateDataPoint(rawDataPoint);
                
                if (parsedDataPoint) {
                  const timestamp = new Date(parsedDataPoint.timestamp);

                  this.logger.debug(`🕒 Checking timestamp: ${timestamp.toISOString()} (HR: ${parsedDataPoint.heartRate}bpm)`);
                  this.logger.debug(`📊 Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
                  this.logger.debug(`✅ In range? ${timestamp >= startDate && timestamp <= endDate}`);

                  if (timestamp >= startDate && timestamp <= endDate) {
                    this.logger.log(`💾 Saving heart rate: ${parsedDataPoint.heartRate}bpm at ${timestamp.toISOString()}`);
                    await this.heartRateService.create({
                      userId,
                      timestamp,
                      heartRate: parsedDataPoint.heartRate,
                    });
                    syncedCount++;
                    dayValidCount++;
                  } else {
                    outOfRangeCount++;
                  }
                } else {
                  invalidDataCount++;
                  this.logger.debug(`❌ Failed to parse data point: ${JSON.stringify(rawDataPoint)}`);
                }
              } else {
                invalidDataCount++;
                this.logger.debug(`❌ Invalid data point: ${JSON.stringify(rawDataPoint)}`);
              }
            }
            this.logger.log(`📈 Day ${totalDaysProcessed} summary: ${dayValidCount} saved, ${outOfRangeCount} out of range, ${invalidDataCount} invalid format`);
          } else {
            this.logger.log(`📭 Day ${totalDaysProcessed}: No heart rate data available`);
          }
        } catch (dayError) {
          this.logger.error(`❌ Error processing day ${currentDate.toISOString().split('T')[0]}:`, dayError);
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      this.logger.log(`🏁 Sync completed! Total days processed: ${totalDaysProcessed}, Total data points synced: ${syncedCount}`);

      return {
        success: true,
        message: `Successfully synced ${syncedCount} heart rate data points`,
        syncedCount,
      };
    } catch (error) {
      this.logger.error('❌ Error syncing heart rate data:', error);
      throw new Error('Failed to sync heart rate data');
    }
  }

  async getHeartRateData(
    startDate: Date,
    endDate: Date,
  ): Promise<HeartRateResponse> {
    this.logger.log('📊 Starting heart rate data retrieval...');
    this.logger.log(`📋 Retrieval parameters: startDate=${startDate.toISOString()}, endDate=${endDate.toISOString()}`);

    try {
      const allHeartRateData: HeartRateDataPoint[] = [];
      const currentDate = new Date(startDate);
      let totalDaysProcessed = 0;

      this.logger.log('📅 Beginning day-by-day data retrieval...');

      while (currentDate <= endDate) {
        totalDaysProcessed++;
        this.logger.log(`📍 Retrieving day ${totalDaysProcessed}: ${currentDate.toISOString().split('T')[0]}`);

        try {
          this.logger.log('🌐 Calling Garmin Connect API for heart rate data...');
          const data = (await this.garminClient.getHeartRate(
            currentDate,
          )) as HeartRateResponse;

          this.logger.log(`📊 Garmin API response: ${data ? 'Data received' : 'No data'}`);
          this.logger.log(`💓 Heart rate values count: ${data?.heartRateValues?.length || 0}`);

          if (data?.heartRateValues?.length) {
            const validData: HeartRateDataPoint[] = [];
            
            for (const rawDataPoint of data.heartRateValues) {
              if (this.isValidHeartRateDataPoint(rawDataPoint)) {
                const parsedDataPoint = this.parseHeartRateDataPoint(rawDataPoint);
                
                if (parsedDataPoint) {
                  const timestamp = new Date(parsedDataPoint.timestamp);
                  if (timestamp >= startDate && timestamp <= endDate) {
                    validData.push(parsedDataPoint);
                  }
                }
              }
            }
            
            this.logger.log(`✅ Day ${totalDaysProcessed}: Found ${validData.length} valid data points in date range`);
            allHeartRateData.push(...validData);
          } else {
            this.logger.log(`📭 Day ${totalDaysProcessed}: No heart rate data available`);
          }
        } catch (dayError) {
          this.logger.error(`❌ Error retrieving day ${currentDate.toISOString().split('T')[0]}:`, dayError);
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      this.logger.log(`🏁 Retrieval completed! Total days processed: ${totalDaysProcessed}, Total data points found: ${allHeartRateData.length}`);

      return {
        heartRateValues: allHeartRateData,
      };
    } catch (error) {
      this.logger.error('❌ Error fetching heart rate data:', error);
      throw new Error('Failed to fetch heart rate data');
    }
  }

  private isValidHeartRateDataPoint(data: unknown): data is HeartRateDataPoint {
    // Handle both object format and array format from Garmin API
    if (Array.isArray(data) && data.length === 2) {
      return (
        typeof data[0] === 'number' && // Unix timestamp in milliseconds
        typeof data[1] === 'number' && // Heart rate value
        data[1] > 0 && data[1] < 300    // Reasonable heart rate range
      );
    }
    
    // Original object format validation (keeping for backwards compatibility)
    return (
      typeof data === 'object' &&
      data !== null &&
      'timestamp' in data &&
      'heartRate' in data &&
      typeof (data as HeartRateDataPoint).timestamp === 'string' &&
      typeof (data as HeartRateDataPoint).heartRate === 'number'
    );
  }

  private parseHeartRateDataPoint(data: unknown): HeartRateDataPoint | null {
    if (Array.isArray(data) && data.length === 2) {
      // Convert Garmin array format [timestamp_ms, heartRate] to object format
      return {
        timestamp: new Date(data[0]).toISOString(),
        heartRate: data[1]
      };
    }
    
    if (typeof data === 'object' && data !== null && 'timestamp' in data && 'heartRate' in data) {
      return data as HeartRateDataPoint;
    }
    
    return null;
  }
}

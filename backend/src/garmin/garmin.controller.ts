import { Body, Controller, Get, Post, Query, Logger } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HeartRateResponseDto, SyncResponseDto } from './dto';
import { GarminService } from './garmin.service';
import { HeartRateResponse, SyncResponse } from './types';

@Controller('garmin')
@ApiTags('garmin')
export class GarminController {
  private readonly logger = new Logger(GarminController.name);
  
  constructor(private readonly garminService: GarminService) {}

  @Post('sync')
  @ApiOperation({ summary: 'Sync heart rate data from Garmin Connect' })
  @ApiResponse({
    status: 200,
    description: 'Heart rate data synced successfully',
    type: SyncResponseDto,
  })
  async syncHeartRateData(
    @Body('userId') userId: string,
    @Body('startDate') startDate: string,
    @Body('endDate') endDate: string,
  ): Promise<SyncResponse> {
    this.logger.log('🔄 Sync endpoint called');
    this.logger.log(`📋 Request body: userId=${userId}, startDate=${startDate}, endDate=${endDate}`);
    
    try {
      const result = await this.garminService.syncHeartRateData(
        userId,
        new Date(startDate),
        new Date(endDate),
      );
      this.logger.log('✅ Sync completed successfully');
      this.logger.log(`📊 Result: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error('❌ Sync failed with error:', error);
      throw error;
    }
  }

  @Get('heart-rate')
  @ApiOperation({ summary: 'Get heart rate data from Garmin Connect' })
  @ApiResponse({
    status: 200,
    description: 'Heart rate data retrieved successfully',
    type: HeartRateResponseDto,
  })
  async getHeartRateData(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<HeartRateResponse> {
    this.logger.log('📊 Get heart rate endpoint called');
    this.logger.log(`📋 Query params: startDate=${startDate}, endDate=${endDate}`);
    
    try {
      const result = await this.garminService.getHeartRateData(
        new Date(startDate),
        new Date(endDate),
      );
      this.logger.log('✅ Heart rate data retrieved successfully');
      return result;
    } catch (error) {
      this.logger.error('❌ Get heart rate failed with error:', error);
      throw error;
    }
  }
}

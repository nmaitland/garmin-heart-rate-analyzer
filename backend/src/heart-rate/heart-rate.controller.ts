import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HeartRate } from './entities/heart-rate.entity';
import { HeartRateService } from './heart-rate.service';

@Controller('heart-rate')
@ApiTags('heart-rate')
export class HeartRateController {
  constructor(private readonly heartRateService: HeartRateService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new heart rate record' })
  @ApiResponse({
    status: 201,
    description: 'Heart rate record created successfully',
  })
  async create(@Body() heartRateData: Partial<HeartRate>): Promise<HeartRate> {
    return this.heartRateService.create(heartRateData);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get heart rate data for a specific time range' })
  @ApiResponse({
    status: 200,
    description: 'Heart rate data retrieved successfully',
  })
  async findByTimeRange(
    @Param('userId') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<HeartRate[]> {
    return this.heartRateService.findByTimeRange(
      userId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get(':userId/average')
  @ApiOperation({ summary: 'Get average heart rate for a specific time range' })
  @ApiResponse({
    status: 200,
    description: 'Average heart rate calculated successfully',
  })
  async getAverageHeartRate(
    @Param('userId') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<number> {
    return this.heartRateService.getAverageHeartRate(
      userId,
      new Date(startDate),
      new Date(endDate),
    );
  }
}

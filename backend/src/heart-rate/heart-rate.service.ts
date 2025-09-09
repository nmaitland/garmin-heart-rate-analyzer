import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { HeartRate } from './entities/heart-rate.entity';

@Injectable()
export class HeartRateService {
  constructor(
    @InjectRepository(HeartRate)
    private heartRateRepository: Repository<HeartRate>,
  ) {}

  async create(heartRateData: Partial<HeartRate>): Promise<HeartRate> {
    const heartRate = this.heartRateRepository.create(heartRateData);
    return this.heartRateRepository.save(heartRate);
  }

  async findByTimeRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<HeartRate[]> {
    return this.heartRateRepository.find({
      where: {
        userId,
        timestamp: Between(startDate, endDate),
      },
      order: {
        timestamp: 'ASC',
      },
    });
  }

  async getAverageHeartRate(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const result = await this.heartRateRepository
      .createQueryBuilder('heart_rate')
      .select('AVG(heart_rate.heartRate)', 'average')
      .where('heart_rate.userId = :userId', { userId })
      .andWhere('heart_rate.timestamp BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getRawOne<{ average: string | null }>();

    return Number(result?.average) || 0;
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HeartRate } from './entities/heart-rate.entity';
import { HeartRateController } from './heart-rate.controller';
import { HeartRateService } from './heart-rate.service';

@Module({
  imports: [TypeOrmModule.forFeature([HeartRate])],
  controllers: [HeartRateController],
  providers: [HeartRateService],
  exports: [HeartRateService],
})
export class HeartRateModule {}

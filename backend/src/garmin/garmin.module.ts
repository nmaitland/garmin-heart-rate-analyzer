import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import garminConfig from '../config/garmin.config';
import { HeartRateModule } from '../heart-rate/heart-rate.module';
import { GarminController } from './garmin.controller';
import { GarminService } from './garmin.service';

@Module({
  imports: [ConfigModule.forFeature(garminConfig), HeartRateModule],
  controllers: [GarminController],
  providers: [GarminService],
  exports: [GarminService],
})
export class GarminModule {}

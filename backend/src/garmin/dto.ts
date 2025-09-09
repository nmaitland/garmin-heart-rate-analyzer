import { ApiProperty } from '@nestjs/swagger';

export class HeartRateDataPointDto {
  @ApiProperty({ description: 'Timestamp of the heart rate measurement' })
  timestamp!: string;

  @ApiProperty({ description: 'Heart rate value in beats per minute' })
  heartRate!: number;
}

export class HeartRateResponseDto {
  @ApiProperty({
    type: [HeartRateDataPointDto],
    description: 'Array of heart rate measurements',
  })
  heartRateValues!: HeartRateDataPointDto[];
}

export class SyncResponseDto {
  @ApiProperty({ description: 'Whether the sync operation was successful' })
  success!: boolean;

  @ApiProperty({ description: 'Message describing the sync operation result' })
  message!: string;

  @ApiProperty({ description: 'Number of heart rate data points synced' })
  syncedCount!: number;
}

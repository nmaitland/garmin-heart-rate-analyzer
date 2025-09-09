import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';

export let app: INestApplication;
export let dataSource: DataSource;

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        envFilePath: '.env.test',
      }),
      AppModule,
    ],
  }).compile();

  app = moduleRef.createNestApplication();
  dataSource = app.get(DataSource);
  await app.init();
}, 30000); // Increase timeout to 30 seconds

afterAll(async () => {
  if (app) {
    await app.close();
  }
});

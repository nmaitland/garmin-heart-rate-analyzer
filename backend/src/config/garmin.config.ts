import { registerAs } from '@nestjs/config';

export default registerAs('garmin', () => ({
  username: process.env.GARMIN_USERNAME,
  password: process.env.GARMIN_PASSWORD,
}));

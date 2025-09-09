import * as request from 'supertest';
import { app } from './setup';

describe('AppController (e2e)', () => {
  it('/api/health (GET)', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('status', 'ok');
        expect(res.body).toHaveProperty('message', 'Hello World!');
      });
  }, 30000); // Increase timeout to 30 seconds
});

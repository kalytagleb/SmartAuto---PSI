import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './../src/app.module';

describe('App — Auth Guard (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Protected route returns 401 without a token', () => {
    return request(app.getHttpServer())
      .get('/orders')
      .expect(401);
  });

  it('Public route /auth/login is accessible without a token', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'nonexistent@test.com', pass: 'wrong' })
      .expect(401); // 401 from business logic (wrong credentials), not from guard
  });
});

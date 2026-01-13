import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/api/questions/generate (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/questions/generate')
      .send({ topic: 'Software Engineer' })
      .expect(201);
  });

  it('/api/articles/generate (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/articles/generate')
      .send({ 
        topic: 'Software Engineer',
        answers: [
          { question: 'Test?', answer: 'Test answer' }
        ]
      })
      .expect(201);
  });
});

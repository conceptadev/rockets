import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { ExceptionsFilter } from '@concepta/rockets';
import request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * Consumer coverage for issue #43 v1 — `opsResource` wired through
 * `createServer({ resources })` in AppModule.
 */
describe('operationResource sample (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    app = await NestFactory.create(AppModule, { logger: ['error'] });
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    const httpAdapterHost = app.get(HttpAdapterHost);
    app.useGlobalFilters(new ExceptionsFilter(httpAdapterHost));
    await app.init();
  }, 30000);

  afterAll(async () => {
    if (app) await app.close();
  });

  it('signup', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: 'ops-sample@example.com',
        password: 'password123',
        name: 'Ops Sample',
      })
      .expect(201);
    accessToken = res.body.accessToken as string;
    expect(accessToken).toBeTruthy();
  });

  it('GET /ops — public query without auth', async () => {
    await request(app.getHttpServer())
      .get('/ops')
      .expect(200)
      .expect({ ok: true });
  });

  it('POST /ops/shout — 401 without bearer token', async () => {
    await request(app.getHttpServer())
      .post('/ops/shout')
      .send({ text: 'hi' })
      .expect(401);
  });

  it('POST /ops/shout — 201 with validated body', async () => {
    await request(app.getHttpServer())
      .post('/ops/shout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ text: 'hello' })
      .expect(201)
      .expect({ text: 'HELLO' });
  });

  it('POST /ops/shout — 400 on empty text', async () => {
    await request(app.getHttpServer())
      .post('/ops/shout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ text: '' })
      .expect(400);
  });
});

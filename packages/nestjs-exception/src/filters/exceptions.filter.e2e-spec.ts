import supertest from 'supertest';
import { HttpAdapterHost } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../__fixtures__/app.module.fixture';
import { ExceptionsFilter } from './exceptions.filter';

describe('Exception (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();

    const httpAdapterHost = app.get(HttpAdapterHost);
    app.useGlobalFilters(new ExceptionsFilter(httpAdapterHost));

    await app.init();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    return app ? await app.close() : undefined;
  });

  it('Should return unknown', async () => {
    const response = await supertest(app.getHttpServer()).get('/test/unknown');
    expect(response.body.errorCode).toEqual('UNKNOWN');
  });

  it('Should return bad request', async () => {
    const response = await supertest(app.getHttpServer()).get(
      '/test/bad-request',
    );
    expect(response.body.errorCode).toEqual('HTTP_BAD_REQUEST');
  });

  it('Should return not found', async () => {
    const response = await supertest(app.getHttpServer()).get('/test/123');
    expect(response.body.errorCode).toEqual('CUSTOM_NOT_FOUND');
    expect(response.body.message).toEqual('Item with id 123 was not found.');
  });
});

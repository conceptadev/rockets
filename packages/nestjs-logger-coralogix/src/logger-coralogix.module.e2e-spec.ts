import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppErrorModuleFixture } from './__fixture__/app-error.module.fixture';
import { LoggerCoralogixTransport } from './transports/logger-coralogix.transport';
import { AppWarnModuleFixture } from './__fixture__/app-warn.module.fixture';

jest.mock('axios', () => {
  return {
    post: jest.fn(() => Promise.resolve({ data: {} })),
  };
});

jest.mock('coralogix-logger');

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let loggerCoralogixTransport: LoggerCoralogixTransport;

  it('/log should call transport log (GET)', async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppErrorModuleFixture],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    loggerCoralogixTransport = moduleFixture.get<LoggerCoralogixTransport>(LoggerCoralogixTransport);
    jest.spyOn(loggerCoralogixTransport, 'log');

    await supertest(app.getHttpServer())
      .get('/log')
      .expect(200);

    expect(loggerCoralogixTransport.log).toHaveBeenCalled();
  });

  it('/log should not call transport log (GET)', async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppWarnModuleFixture],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    loggerCoralogixTransport = moduleFixture.get<LoggerCoralogixTransport>(LoggerCoralogixTransport);
    jest.spyOn(loggerCoralogixTransport, 'log');

    await supertest(app.getHttpServer())
      .get('/log')
      .expect(200);

    expect(loggerCoralogixTransport.log).toHaveBeenCalledTimes(0);
  });
});
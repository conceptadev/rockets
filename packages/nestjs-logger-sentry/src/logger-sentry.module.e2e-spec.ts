import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppErrorModuleFixture } from './__fixture__/app-error.module.fixture';
import { LoggerSentryTransport } from './transports/logger-sentry.transport';
import { AppWarnModuleFixture } from './__fixture__/app-warn.module.fixture';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let loggerSentryTransport: LoggerSentryTransport;

  it('/log should call transport log (GET)', async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppErrorModuleFixture],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    loggerSentryTransport = moduleFixture.get<LoggerSentryTransport>(LoggerSentryTransport);
    jest.spyOn(loggerSentryTransport, 'log');

    await supertest(app.getHttpServer())
      .get('/log')
      .expect(200);

    expect(loggerSentryTransport.log).toHaveBeenCalled();
  });

  it('/log should not call transport log (GET)', async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppWarnModuleFixture],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    loggerSentryTransport = moduleFixture.get<LoggerSentryTransport>(LoggerSentryTransport);
    jest.spyOn(loggerSentryTransport, 'log');

    await supertest(app.getHttpServer())
      .get('/log')
      .expect(200);

    expect(loggerSentryTransport.log).toHaveBeenCalledTimes(0);
  });
});
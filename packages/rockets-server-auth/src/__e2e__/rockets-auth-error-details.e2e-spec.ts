import { describe, it, expect, afterAll } from 'vitest';
import 'reflect-metadata';

import {
  BadRequestException,
  Controller,
  Get,
  INestApplication,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { TestingModule } from '@nestjs/testing';
import request from 'supertest';
import {
  AuthPublic,
  attachErrorDetails,
  detailedErrorSerializer,
} from '@concepta/rockets-core';

import {
  applyRocketsAuthE2eAppGlobals,
  createRocketsAuthStandardE2eTestingModule,
} from './helpers/rockets-auth-e2e-app.factory';

/**
 * #87 — an auth-composed app (RocketsModule + defineRocketsAuth) used to
 * run a compatibility filter that never read the `details` symbol and
 * had no serializer seam, so structured validation details (#55) never
 * reached it even though core/server apps already had them. The compat
 * filter is gone; the global filter here is the same
 * `RocketsCoreExceptionsFilter` core and server use.
 */
@Controller('test-errors')
@ApiTags('Test')
class TestAuthErrorController {
  @Get('bad-request-with-details')
  @AuthPublic()
  @ApiOkResponse({ description: 'Always throws — test route' })
  badRequestWithDetails(): never {
    throw attachErrorDetails(
      new BadRequestException({
        statusCode: 400,
        message: 'ref must be unique',
        error: 'Bad Request',
      }),
      [{ path: ['ref'], message: 'must be unique' }],
    );
  }

  @Get('runtime-500-with-details')
  @AuthPublic()
  @ApiOkResponse({ description: 'Always throws — test route' })
  runtime500WithDetails(): never {
    throw attachErrorDetails(new Error('internal: dsn=secret://x'), [
      { path: ['ref'], message: 'internal detail that must not leak' },
    ]);
  }
}

async function bootAuthApp(
  serializer?: Parameters<typeof applyRocketsAuthE2eAppGlobals>[1],
): Promise<{ app: INestApplication; module: TestingModule }> {
  const module = await createRocketsAuthStandardE2eTestingModule({
    mockEmailService: { sendMail: async () => undefined },
    extraControllers: [TestAuthErrorController],
  });
  const app = module.createNestApplication();
  applyRocketsAuthE2eAppGlobals(app, serializer);
  await app.init();
  return { app, module };
}

describe('RocketsAuth error details (e2e) — #87 compat filter parity', () => {
  const apps: INestApplication[] = [];

  afterAll(async () => {
    await Promise.all(apps.map((app) => app.close()));
  });

  it('default serializer: byte-shape unchanged, no details key', async () => {
    const { app } = await bootAuthApp();
    apps.push(app);

    const res = await request(app.getHttpServer())
      .get('/test-errors/bad-request-with-details')
      .expect(400);

    expect(res.body.message).toBe('ref must be unique');
    expect(res.body).not.toHaveProperty('details');
  });

  it('detailedErrorSerializer: details reach an auth-composed app', async () => {
    const { app } = await bootAuthApp(detailedErrorSerializer);
    apps.push(app);

    const res = await request(app.getHttpServer())
      .get('/test-errors/bad-request-with-details')
      .expect(400);

    expect(res.body.details).toEqual([
      { path: ['ref'], message: 'must be unique' },
    ]);
  });

  it('masks details on a 5xx', async () => {
    const { app } = await bootAuthApp(detailedErrorSerializer);
    apps.push(app);

    const res = await request(app.getHttpServer())
      .get('/test-errors/runtime-500-with-details')
      .expect(500);

    expect(res.body.details).toBeUndefined();
  });
});

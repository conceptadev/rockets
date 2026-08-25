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
  type CreateRocketsAuthStandardE2eModuleOptions,
} from './helpers/rockets-auth-e2e-app.factory';
import { UserMetadataValidatedDtoFixture } from '../__fixtures__/user/user-metadata-validated.dto.fixture';
import { UserMetadataEntityFixture } from '../__fixtures__/user/user-metadata.entity.fixture';

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
  overrides?: CreateRocketsAuthStandardE2eModuleOptions['rocketsAuthOverrides'],
): Promise<{ app: INestApplication; module: TestingModule }> {
  const module = await createRocketsAuthStandardE2eTestingModule({
    mockEmailService: { sendMail: async () => undefined },
    extraControllers: [TestAuthErrorController],
    ...(overrides ? { rocketsAuthOverrides: overrides } : {}),
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

    // The WHOLE envelope, not just `message` and the absence of
    // `details`. Asserting two of five facts would stay green while a
    // serializer that dropped `errorCode` broke the byte-shape
    // compatibility this PR exists to protect. Route is deliberately
    // the details-BEARING one: a 400 that can never carry details
    // would pass even if the default serializer started spreading them.
    expect(Object.keys(res.body).sort()).toEqual([
      'errorCode',
      'message',
      'statusCode',
      'timestamp',
    ]);
    expect(res.body.statusCode).toBe(400);
    expect(res.body.errorCode).toBe('HTTP_BAD_REQUEST');
    expect(res.body.message).toBe('ref must be unique');
    expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
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
    // `details` is APPENDED to the default envelope, not a replacement
    // for it — the opt-in must not cost a consumer the four keys.
    expect(Object.keys(res.body).sort()).toEqual([
      'details',
      'errorCode',
      'message',
      'statusCode',
      'timestamp',
    ]);
    expect(res.body.statusCode).toBe(400);
    expect(res.body.errorCode).toBe('HTTP_BAD_REQUEST');
    expect(res.body.message).toBe('ref must be unique');
  });

  it('masks details on a 5xx', async () => {
    const { app } = await bootAuthApp(detailedErrorSerializer);
    apps.push(app);

    const res = await request(app.getHttpServer())
      .get('/test-errors/runtime-500-with-details')
      .expect(500);

    expect(res.body.details).toBeUndefined();
    // The masking is only worth anything if the leak-bearing strings
    // are absent from the WHOLE body, not just from a `details` key.
    const serialized = JSON.stringify(res.body);
    expect(serialized).not.toContain('dsn=secret');
    expect(serialized).not.toContain('internal detail that must not leak');
    expect(res.body.statusCode).toBe(500);
    expect(res.body.message).toBe('Internal Server Error');
  });
});

/**
 * The synthetic controller above proves the FILTER reaches an
 * auth-composed app. It does not prove any Rockets code actually MINTS
 * details on a route a real consumer calls — the seal's point.
 *
 * `PATCH /me` is that route: `MeController.updateUser` calls
 * `whitelistedFromDto(userMetadataConfig.updateDto, body.userMetadata)`
 * synchronously in the request, and that helper is the one production
 * site that raises a `BadRequestException` carrying
 * `classValidatorErrorsToDetails` findings via `attachErrorDetails`.
 * The controller is registered
 * in this exact app: `defineRocketsAuth` sets `identity.userMetadata`,
 * which is what makes `RocketsModule` mount `MeController`.
 *
 * (The other production minter — the invitation-acceptance listener —
 * is NOT reachable over HTTP: its event is published from an
 * `onCommit` callback flushed with `Promise.allSettled`, `commit()` is
 * a synchronous `void`, `EventBus.bind` swallows handler errors, and
 * the listener itself catches to honour the event-listener contract.
 * That endpoint returns 200 whatever the metadata payload does. Three
 * of those four barriers are upstream. Documented rather than worked
 * around.)
 */
describe('RocketsAuth error details (e2e) — real production minter: PATCH /me', () => {
  const apps: INestApplication[] = [];
  const credentials = {
    email: 'me-details-e2e@example.com',
    username: 'me-details-e2e',
    active: true,
    password: 'OriginalP@ssw0rd',
  };

  afterAll(async () => {
    await Promise.all(apps.map((app) => app.close()));
  });

  async function bootWithValidatingMetadata(
    serializer?: Parameters<typeof applyRocketsAuthE2eAppGlobals>[1],
  ): Promise<{ app: INestApplication; token: string }> {
    const { app } = await bootAuthApp(serializer, {
      userMetadata: {
        entity: UserMetadataEntityFixture,
        createDto: UserMetadataValidatedDtoFixture,
        updateDto: UserMetadataValidatedDtoFixture,
      },
    });
    apps.push(app);

    await request(app.getHttpServer())
      .post('/signup')
      .send(credentials)
      .expect(201);

    const login = await request(app.getHttpServer())
      .post('/token/password')
      .send({ username: credentials.username, password: credentials.password })
      .expect(200);

    return { app, token: login.body.accessToken as string };
  }

  it('detailedErrorSerializer: whitelistedFromDto findings reach the response', async () => {
    const { app, token } = await bootWithValidatingMetadata(
      detailedErrorSerializer,
    );

    const res = await request(app.getHttpServer())
      .patch('/me')
      .set('Authorization', `Bearer ${token}`)
      // Both violations survive `enableImplicitConversion`: a 12-char
      // string is still over `@MaxLength(5)`, and 999 is still over
      // `@Max(150)`. A `@IsString()` violation would be laundered.
      .send({ userMetadata: { firstName: 'far-too-long', age: 999 } })
      .expect(400);

    expect(res.body.details).toEqual([
      {
        path: ['firstName'],
        message: 'firstName must be shorter than or equal to 5 characters',
      },
      { path: ['age'], message: 'age must not be greater than 150' },
    ]);
    expect(res.body.statusCode).toBe(400);
    expect(res.body.errorCode).toBe('HTTP_BAD_REQUEST');
  });

  it('default serializer: the same route keeps the four-key envelope', async () => {
    const { app, token } = await bootWithValidatingMetadata();

    const res = await request(app.getHttpServer())
      .patch('/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ userMetadata: { firstName: 'far-too-long', age: 999 } })
      .expect(400);

    expect(Object.keys(res.body).sort()).toEqual([
      'errorCode',
      'message',
      'statusCode',
      'timestamp',
    ]);
  });

  it('a valid payload still succeeds — the 400 above is validation, not wiring', async () => {
    const { app, token } = await bootWithValidatingMetadata(
      detailedErrorSerializer,
    );

    const res = await request(app.getHttpServer())
      .patch('/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ userMetadata: { firstName: 'Ana', age: 33 } })
      .expect(200);

    expect(res.body.userMetadata.firstName).toBe('Ana');
    expect(res.body.userMetadata.age).toBe(33);
  });

  /**
   * DEFECT PINNED, NOT ENDORSED — issue #103.
   *
   * The three tests above supply `UserMetadataValidatedDtoFixture`. That
   * is not decoration of a passing case: with the DEFAULT metadata DTO
   * this route is broken, and writing those tests is what surfaced it.
   *
   * `RocketsAuthUserMetadataDto` carries `@Expose()` / `@ApiProperty()`
   * but no class-validator metadata, and `whitelistedFromDto` validates
   * with `forbidUnknownValues: true`. class-validator rejects a
   * metadata-less target outright, so `MeController.updateUser` 400s on
   * EVERY payload — `{}` included, since its own `?? {}` fallback hits
   * the same wall — and leaks an internal validator string to the
   * client. It is the auth e2e helper's default and the documented base
   * extension point, so an auth app that never subclasses has no
   * working `PATCH /me` at all.
   *
   * Every existing `/me` spec in `rockets-server` supplies a decorated
   * DTO, and `rockets-server-auth` had no `PATCH /me` coverage before
   * this file — which is why a green suite hid it.
   *
   * Pinned the way the #83 whitelist trap is pinned: asserting the
   * CURRENT broken behaviour so the claim above stays honest. Fixing
   * #103 SHOULD fail this test; update it then, deliberately. Not fixed
   * here because the fix is a semantic change to a shared core util
   * (`whitelistedFromDto`) with real options to weigh, and this is a
   * changelog-accuracy PR.
   */
  it('DEFECT #103: PATCH /me 400s on every payload with the default metadata DTO', async () => {
    const { app } = await bootAuthApp();
    apps.push(app);

    const creds = {
      email: 'me-default-dto-e2e@example.com',
      username: 'me-default-dto-e2e',
      active: true,
      password: 'OriginalP@ssw0rd',
    };
    await request(app.getHttpServer()).post('/signup').send(creds).expect(201);
    const login = await request(app.getHttpServer())
      .post('/token/password')
      .send({ username: creds.username, password: creds.password })
      .expect(200);
    const token = login.body.accessToken as string;

    // An EMPTY body too: this is not "invalid input rejected", it is the
    // endpoint being unusable.
    for (const body of [
      {},
      { userMetadata: {} },
      { userMetadata: { firstName: 'Ana' } },
    ]) {
      const res = await request(app.getHttpServer())
        .patch('/me')
        .set('Authorization', `Bearer ${token}`)
        .send(body)
        .expect(400);

      expect(res.body.message).toEqual([
        'an unknown value was passed to the validate function',
      ]);
    }
  });
});

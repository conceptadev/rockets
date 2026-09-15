/**
 * `actor` forwarded through `RocketsModule` (#119).
 *
 * Apps composed through this module never call `RocketsCoreModule.forRoot`
 * themselves, so an option core accepts but this module drops would be
 * silently unusable here. The probe route returns the request's actor as
 * the core overlay published it.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { Controller, Get, INestApplication, Req } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Test } from '@nestjs/testing';
import {
  ActorCtx,
  getAppContext,
  type Actor,
  type RocketsActorOptions,
} from '@concepta/rockets-core';
import request from 'supertest';

import { E2eFakeRepositoryModule } from './__e2e__/helpers/e2e-fake-repository.module';
import { ServerAuthAdapterFixture } from './__fixtures__/providers/server-auth.adapter.fixture';
import type { RocketsOptions } from './rockets.module-definition';
import { userMetadataConfigFixture } from './__fixtures__/schemas/user-metadata.schema.fixture';
import { RocketsModule } from './rockets.module';
import { e2eAuthBootstrap } from './__fixtures__/providers/e2e-auth-bootstrap.fixture';

@ApiTags('actor-probe')
@Controller('actor-probe')
class ActorProbeController {
  @Get()
  @ApiOkResponse({ description: 'probe' })
  read(@Req() req: object): Actor | null {
    const ctx = getAppContext(req);
    return ctx.supports(ActorCtx) ? ctx.with(ActorCtx) : null;
  }
}

const baseOptions: RocketsOptions = {
  settings: {},
  auth: e2eAuthBootstrap(ServerAuthAdapterFixture),
  userMetadata: userMetadataConfigFixture,
  repository: E2eFakeRepositoryModule,
};

const rolesMetadata: RocketsActorOptions = {
  metadata: (user) => ({ roles: user.claims?.roles }),
};

describe('RocketsModule actor (e2e)', () => {
  let app: INestApplication;

  afterEach(async () => {
    if (app) {
      await app.close();
      app = undefined as unknown as INestApplication;
    }
  });

  async function boot(options: RocketsOptions): Promise<void> {
    const moduleRef = await Test.createTestingModule({
      imports: [RocketsModule.forRoot(options)],
      controllers: [ActorProbeController],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  }

  it('copies the mapped user data into the actor', async () => {
    await boot({ ...baseOptions, actor: rolesMetadata });

    const res = await request(app.getHttpServer())
      .get('/actor-probe')
      .set('Authorization', 'Bearer valid-token')
      .expect(200);

    expect(res.body).toEqual({
      id: 'serverauth-user-1',
      type: 'user',
      metadata: { roles: ['admin'] },
    });
  });

  it('leaves the actor with only the id when the option is omitted', async () => {
    await boot(baseOptions);

    const res = await request(app.getHttpServer())
      .get('/actor-probe')
      .set('Authorization', 'Bearer valid-token')
      .expect(200);

    expect(res.body).toEqual({ id: 'serverauth-user-1', type: 'user' });
  });
});

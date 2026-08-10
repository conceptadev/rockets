import { afterAll, beforeAll, describe, it } from 'vitest';
import {
  Controller,
  Get,
  INestApplication,
  Injectable,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import request from 'supertest';

import {
  defineModuleResource,
  defineAuthAdapter,
  extractBearerToken,
  type AuthAdapterInterface,
  type AuthAttemptResult,
  type AuthBootstrap,
  type AuthRequest,
} from '@concepta/rockets-core';
import { createServer } from '../create-server';

@Injectable()
class SharedIdentityAdapter implements AuthAdapterInterface {
  async authenticate(request: AuthRequest): Promise<AuthAttemptResult> {
    const token = extractBearerToken(request);
    if (token === null) return { matched: false };
    if (token !== 'shared-user-token') {
      return { matched: true, error: new UnauthorizedException() };
    }
    return {
      matched: true,
      user: { id: 'user-1', sub: 'user-1', email: 'user@example.com' },
    };
  }
}

@Injectable()
class ServiceKeyAdapter implements AuthAdapterInterface {
  async authenticate(request: AuthRequest): Promise<AuthAttemptResult> {
    const key = request.headers['x-api-key'];
    if (key === undefined) return { matched: false };
    if (key !== 'workflow-service-key') {
      return { matched: true, error: new UnauthorizedException() };
    }
    return {
      matched: true,
      user: { id: 'service-1', sub: 'service-1', claims: { type: 'service' } },
    };
  }
}

function authBootstrap(
  adapter: typeof SharedIdentityAdapter | typeof ServiceKeyAdapter,
): AuthBootstrap {
  return defineAuthAdapter(adapter);
}

@Controller('workflow')
@ApiTags('Workflow')
class WorkflowController {
  @Get('actor')
  @ApiOkResponse({ description: 'The authenticated workflow actor.' })
  actor(@Req() request: { user?: { id?: string } }): { actorId?: string } {
    return { actorId: request.user?.id };
  }
}

describe('createServer — launch-facing composition (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const entryModule = createServer({
      auth: [
        authBootstrap(SharedIdentityAdapter),
        authBootstrap(ServiceKeyAdapter),
      ],
      resources: [defineModuleResource({ controllers: [WorkflowController] })],
    });

    app = await NestFactory.create(entryModule, { logger: false });
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('boots directly from one server definition without user metadata', async () => {
    await request(app.getHttpServer())
      .get('/workflow/actor')
      .set('Authorization', 'Bearer shared-user-token')
      .expect(200, { actorId: 'user-1' });
  });

  it('tries auth integrations in order and accepts a service credential fallback', async () => {
    await request(app.getHttpServer())
      .get('/workflow/actor')
      .set('x-api-key', 'workflow-service-key')
      .expect(200, { actorId: 'service-1' });
  });

  it('keeps the workflow private by default', async () => {
    await request(app.getHttpServer()).get('/workflow/actor').expect(401);
  });
});

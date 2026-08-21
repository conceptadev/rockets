import { Controller, Get, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  collectRegisteredRoutes,
  validateRegisteredRoutes,
} from '../infrastructure/routing/validate-registered-routes';

@Controller('users')
@ApiTags('Users')
class UserByIdController {
  @Get(':id')
  @ApiOkResponse({ description: 'Read user by id' })
  read(): { ok: boolean } {
    return { ok: true };
  }
}

@Controller('users')
@ApiTags('Users')
class CurrentUserController {
  @Get('me')
  @ApiOkResponse({ description: 'Read current user' })
  read(): { ok: boolean } {
    return { ok: true };
  }
}

describe('registered route validator e2e', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UserByIdController, CurrentUserController],
    }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('inspects post-boot adapter routes including global prefix', () => {
    expect(collectRegisteredRoutes(app).map((route) => route.path)).toEqual(
      expect.arrayContaining(['/api/users/:id', '/api/users/me']),
    );
    expect(() => validateRegisteredRoutes(app)).toThrow(
      /duplicate registered route GET/,
    );
  });
});

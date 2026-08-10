import { describe, expect, it, vi } from 'vitest';
import type { RepositoryModuleInterface } from '@concepta/nestjs-repository';
import { createServer } from '@concepta/rockets';

import {
  defineRocketsAuth,
  type DefineRocketsAuthInput,
} from './define-rockets-auth';

class UserEntity {}
class UserMetadataEntity {}
class UserMetadataCreateDto {
  userId!: string;
}
class UserMetadataUpdateDto {
  id!: string;
}

const repository = {
  name: 'test-repository',
  forFeature: vi.fn(),
} as unknown as RepositoryModuleInterface;

function input(
  rocketsDefaults?: DefineRocketsAuthInput['rocketsDefaults'],
): DefineRocketsAuthInput {
  return {
    persistence: {
      module: repository,
      entities: { user: UserEntity },
    },
    userMetadata: {
      entity: UserMetadataEntity,
      createDto: UserMetadataCreateDto,
      updateDto: UserMetadataUpdateDto,
    },
    userCrud: { model: UserEntity },
    useFactory: () => ({}),
    rocketsDefaults,
  } as DefineRocketsAuthInput;
}

describe('defineRocketsAuth', () => {
  it('defaults the Rockets guard off because built-in auth owns a JWT app guard', () => {
    const bootstrap = defineRocketsAuth(input());

    expect(bootstrap.contributes?.enableGlobalGuard).toBe(false);
  });

  it('allows mixed-auth hosts to opt back into the Rockets guard chain', () => {
    const bootstrap = defineRocketsAuth(input({ enableGlobalGuard: true }));

    expect(bootstrap.contributes?.enableGlobalGuard).toBe(true);
  });

  it('declares the upstream JwtGuard as the replacement app guard', () => {
    const bootstrap = defineRocketsAuth(input());

    expect(bootstrap.contributes?.providesAppGuard).toBe(true);
  });

  it('withdraws the guard declaration when the host disables the upstream guard', () => {
    const bootstrap = defineRocketsAuth({
      ...input(),
      auth: { appGuard: false },
    });

    expect(bootstrap.contributes?.providesAppGuard).toBe(false);
  });

  it('fails server composition when both guard layers end up disabled', () => {
    // appGuard: false removes the upstream JwtGuard; without
    // rocketsDefaults.enableGlobalGuard: true nothing guards the app —
    // the server invariant must reject this half-configured state.
    const halfConfigured = defineRocketsAuth({
      ...input(),
      auth: { appGuard: false },
    });

    expect(() => createServer({ auth: halfConfigured })).toThrow(
      /providesAppGuard|enableGlobalGuard/,
    );
  });
});

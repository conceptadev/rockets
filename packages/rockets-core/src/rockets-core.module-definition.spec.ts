import { describe, expect, it } from 'vitest';
import { Injectable } from '@nestjs/common';

import type {
  AuthAdapterInterface,
  AuthAttemptResult,
  AuthRequest,
} from './domain/interfaces/auth-adapter.interface';
import { RocketsCoreModule } from './rockets-core.module';
import { defineAuthAdapter } from './infrastructure/auth/define-auth-adapter';

@Injectable()
class BoundaryAuthAdapter implements AuthAdapterInterface {
  async authenticate(_request: AuthRequest): Promise<AuthAttemptResult> {
    return { matched: false };
  }
}

describe('RocketsCoreModule — auth bootstrap boundary', () => {
  it('rejects a bootstrap that still carries identity', () => {
    expect(() =>
      RocketsCoreModule.forRoot({
        auth: defineAuthAdapter(BoundaryAuthAdapter, {
          identity: { resources: [] },
        }),
      }),
    ).toThrow(/identity\/contributes/);
  });

  it('rejects a bootstrap that still carries contributes', () => {
    expect(() =>
      RocketsCoreModule.forRoot({
        auth: defineAuthAdapter(BoundaryAuthAdapter, {
          contributes: { providesAppGuard: true },
        }),
      }),
    ).toThrow(/identity\/contributes/);
  });

  it('accepts a plain adapter bootstrap', () => {
    expect(
      RocketsCoreModule.forRoot({
        auth: defineAuthAdapter(BoundaryAuthAdapter),
      }),
    ).toBeDefined();
  });
});

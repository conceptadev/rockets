import { describe, expect, it } from 'vitest';
import { Injectable } from '@nestjs/common';

import type {
  AuthAdapterInterface,
  AuthAttemptResult,
  AuthRequest,
} from '../../domain/interfaces/auth-adapter.interface';
import * as RocketsCore from '../../index';

@Injectable()
class SpecAuthAdapter implements AuthAdapterInterface {
  async authenticate(_request: AuthRequest): Promise<AuthAttemptResult> {
    return { matched: false };
  }
}

describe('defineAuthAdapter', () => {
  it('exports a complete bootstrap for a custom adapter', () => {
    const defineAuthAdapter = (
      RocketsCore as unknown as {
        defineAuthAdapter: (
          adapter: typeof SpecAuthAdapter,
          options?: { providers?: unknown[]; contributes?: { resources: [] } },
        ) => {
          adapter: unknown;
          contributes?: unknown;
          forRoot?: () => {
            providers?: unknown[];
            exports?: unknown[];
          };
        };
      }
    ).defineAuthAdapter;
    const dependency = { provide: 'AUTH_DEPENDENCY', useValue: true };
    const contributes = { resources: [] as [] };

    const bootstrap = defineAuthAdapter(SpecAuthAdapter, {
      providers: [dependency],
      contributes,
    });
    const module = bootstrap.forRoot!();

    expect(bootstrap.adapter).toBe(SpecAuthAdapter);
    expect(bootstrap.contributes).toBe(contributes);
    expect(module.providers).toEqual([dependency, SpecAuthAdapter]);
    expect(module.exports).toEqual([SpecAuthAdapter]);
  });
});

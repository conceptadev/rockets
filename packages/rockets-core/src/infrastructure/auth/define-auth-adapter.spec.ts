import { describe, expect, it } from 'vitest';
import { Injectable, type Provider } from '@nestjs/common';

import type {
  AuthAdapterInterface,
  AuthAttemptResult,
  AuthRequest,
} from '../../domain/interfaces/auth-adapter.interface';
import type { AuthBootstrapContributions } from '../../domain/interfaces/auth-bootstrap.interface';
// Imported from the package index (not the module directly) so this spec fails
// to compile if `defineAuthAdapter` stops being part of the public surface.
import { defineAuthAdapter } from '../../index';

@Injectable()
class SpecAuthAdapter implements AuthAdapterInterface {
  async authenticate(_request: AuthRequest): Promise<AuthAttemptResult> {
    return { matched: false };
  }
}

describe('defineAuthAdapter', () => {
  it('exports a complete bootstrap for a custom adapter', () => {
    const dependency: Provider = {
      provide: 'AUTH_DEPENDENCY',
      useValue: true,
    };
    const contributes: AuthBootstrapContributions = { resources: [] };

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

  it('registers and exports the adapter with no options', () => {
    const module = defineAuthAdapter(SpecAuthAdapter).forRoot!();

    expect(module.imports).toEqual([]);
    expect(module.controllers).toEqual([]);
    expect(module.providers).toEqual([SpecAuthAdapter]);
    expect(module.exports).toEqual([SpecAuthAdapter]);
  });

  it('keeps extra wiring private unless explicitly exported', () => {
    class SideModule {}
    class SideController {}
    const internal: Provider = { provide: 'INTERNAL', useValue: 1 };
    const shared: Provider = { provide: 'SHARED', useValue: 2 };

    const module = defineAuthAdapter(SpecAuthAdapter, {
      imports: [SideModule],
      controllers: [SideController],
      providers: [internal, shared],
      exports: ['SHARED'],
    }).forRoot!();

    expect(module.imports).toEqual([SideModule]);
    expect(module.controllers).toEqual([SideController]);
    expect(module.providers).toEqual([internal, shared, SpecAuthAdapter]);
    expect(module.exports).toEqual([SpecAuthAdapter, 'SHARED']);
  });
});

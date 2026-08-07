import { describe, expect, it } from 'vitest';

import * as Rockets from './index';
import { RocketsModule } from './rockets.module';

describe('createServer', () => {
  it('is the canonical server-definition export', () => {
    expect(
      (Rockets as unknown as Record<string, unknown>).createServer,
    ).toBeTypeOf('function');
  });

  it('materializes a Nest entry module from one Rockets definition', () => {
    const createServer = (
      Rockets as unknown as {
        createServer: (definition: Record<string, unknown>) => {
          module: unknown;
        };
      }
    ).createServer;

    const entryModule = createServer({
      enableGlobalGuard: false,
      disableController: { me: true },
    });

    expect(entryModule.module).toBe(RocketsModule);
  });
});

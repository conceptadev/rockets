import { describe, expect, it } from 'vitest';

// Imported from the package index (not the module directly) so this spec fails
// to compile if `createServer` stops being part of the public surface.
import { createServer } from './index';
import { RocketsModule } from './rockets.module';

describe('createServer', () => {
  it('materializes a Nest entry module from one Rockets definition', () => {
    const entryModule = createServer({
      enableGlobalGuard: false,
      disableController: { me: true },
    });

    expect(entryModule.module).toBe(RocketsModule);
  });
});

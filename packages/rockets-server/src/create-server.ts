import type { DynamicModule } from '@nestjs/common';

import { RocketsModule } from './rockets.module';
import type { RocketsOptions } from './rockets.module-definition';

/**
 * Turn one Rockets definition into the Nest entry module for the server.
 *
 * The result can be passed directly to `NestFactory.create()` or imported by a
 * larger host module. `RocketsModule.forRoot()` remains available as the
 * lower-level registration surface; this is the canonical definition-first
 * facade used by launchers and platform tooling.
 */
export function createServer(definition: RocketsOptions): DynamicModule {
  return RocketsModule.forRoot(definition);
}

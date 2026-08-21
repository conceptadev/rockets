import type { DynamicModule } from '@nestjs/common';

import type { OperationResource } from '../../../domain/interfaces/operation-resource.interface';

export function materialiseOperationResource(
  bundle: OperationResource,
): DynamicModule {
  class RocketsOperationResource {}

  return {
    module: RocketsOperationResource,
    imports: bundle.imports,
    controllers: [bundle.controller],
    providers: [...bundle.providers],
    exports: bundle.exports,
  };
}

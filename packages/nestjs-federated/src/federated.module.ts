import { DynamicModule, Module } from '@nestjs/common';

import {
  FederatedAsyncOptions,
  FederatedModuleClass,
  FederatedOptions,
  createFederatedExports,
  createFederatedImports,
  createFederatedProviders,
} from './federated.module-definition';
import { FederatedMutateService } from './services/federated-mutate.service';
import { FederatedOAuthService } from './services/federated-oauth.service';
import { FederatedService } from './services/federated.service';
import { FederatedMissingEntitiesOptionsException } from './exceptions/federated-missing-entities-options.exception';

@Module({
  providers: [FederatedService, FederatedOAuthService, FederatedMutateService],
  exports: [FederatedService, FederatedOAuthService, FederatedMutateService],
})
export class FederatedModule extends FederatedModuleClass {
  static register(options: FederatedOptions): DynamicModule {
    return super.register(options);
  }

  static registerAsync(options: FederatedAsyncOptions): DynamicModule {
    return super.registerAsync(options);
  }

  static forRoot(options: FederatedOptions): DynamicModule {
    return super.register({ ...options, global: true });
  }

  static forRootAsync(options: FederatedAsyncOptions): DynamicModule {
    return super.registerAsync({ ...options, global: true });
  }

  static forFeature(options: FederatedOptions): DynamicModule {
    const { entities } = options;

    if (!entities) {
      throw new FederatedMissingEntitiesOptionsException();
    }

    return {
      module: FederatedModule,
      imports: createFederatedImports({ entities }),
      providers: createFederatedProviders({ overrides: options }),
      exports: createFederatedExports(),
    };
  }
}

import { DynamicModule, Module } from '@nestjs/common';

import {
  FederatedAsyncOptions,
  FederatedModuleClass,
  FederatedOptions,
} from './federated.module-definition';
import { FederatedModelService } from './services/federated-model.service';
import { FederatedOAuthService } from './services/federated-oauth.service';
import { FederatedService } from './services/federated.service';

@Module({
  providers: [FederatedService, FederatedOAuthService, FederatedModelService],
  exports: [FederatedService, FederatedOAuthService, FederatedModelService],
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
}

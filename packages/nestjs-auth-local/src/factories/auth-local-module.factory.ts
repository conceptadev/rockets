import {
  AUTH_LOCAL_MODULE_OPTIONS_TOKEN,
  GET_USER_SERVICE_TOKEN,
  ISSUE_TOKEN_SERVICE_TOKEN,
} from '../config/auth-local.config';
import {
  ConfigAsyncInterface,
  ConfigInterface,
  ModuleFactoryInterface,
} from '@rockts-org/nestjs-common';

import { AuthLocalController } from '../auth-local.controller';
import { AuthLocalCoreModule } from '../auth-local-core.module';
import { AuthLocalModule } from '../auth-local.module';
import { AuthLocalOptionsInterface } from '../interfaces/auth-local-options.interface';
import { LocalStrategy } from '../local.strategy';

export class AuthLocalModuleFactory
  implements ModuleFactoryInterface<AuthLocalOptionsInterface>
{
  forRoot(config: ConfigInterface<AuthLocalOptionsInterface>) {
    return {
      module: AuthLocalModule,
      global: config?.global ?? false,
      imports: [
        ...(config?.imports ?? []),
        AuthLocalCoreModule.forRoot(config),
      ],
      providers: [
        AuthLocalController,
        LocalStrategy,
        {
          provide: GET_USER_SERVICE_TOKEN,
          useExisting: config?.options?.getUserService,
        },
        {
          provide: ISSUE_TOKEN_SERVICE_TOKEN,
          useExisting: config?.options?.issueTokenService,
        },
      ],
      exports: [
        GET_USER_SERVICE_TOKEN,
        ISSUE_TOKEN_SERVICE_TOKEN,
        AuthLocalController,
      ],
      controllers: [AuthLocalController],
    };
  }

  forRootAsync(options: ConfigAsyncInterface<AuthLocalOptionsInterface>) {
    return {
      module: AuthLocalModule,
      global: options?.global ?? false,
      imports: [
        ...(options?.imports ?? []),
        AuthLocalCoreModule.forRootAsync(options),
      ],
      providers: [
        AuthLocalController,
        LocalStrategy,
        {
          provide: GET_USER_SERVICE_TOKEN,
          inject: [AUTH_LOCAL_MODULE_OPTIONS_TOKEN],
          useFactory: async (asyncOptions: AuthLocalOptionsInterface) => {
            return asyncOptions.getUserService;
          },
        },
        {
          provide: ISSUE_TOKEN_SERVICE_TOKEN,
          inject: [AUTH_LOCAL_MODULE_OPTIONS_TOKEN],
          useFactory: async (asyncOptions: AuthLocalOptionsInterface) => {
            return asyncOptions.issueTokenService;
          },
        },
      ],
      exports: [
        GET_USER_SERVICE_TOKEN,
        ISSUE_TOKEN_SERVICE_TOKEN,
        AuthLocalController,
      ],
      controllers: [AuthLocalController],
    };
  }
}

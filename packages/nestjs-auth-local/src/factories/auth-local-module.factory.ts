import { ModuleFactoryInterface } from '@rockts-org/nestjs-common';
import { AuthLocalModule } from '../auth-local.module';
import { AuthLocalCoreModule } from '../auth-local-core.module';
import {
  AuthLocalAsyncOptionsInterface,
  AuthLocalOptionsInterface,
} from '../interfaces/auth-local-options.interface';
import { AuthLocalController } from '../auth-local.controller';
import { LocalStrategy } from '../local.strategy';
import {
  AUTH_LOCAL_MODULE_CONFIG_TOKEN,
  GET_USER_SERVICE_TOKEN,
  ISSUE_TOKEN_SERVICE_TOKEN,
} from '../config/auth-local.config';

export class AuthLocalModuleFactory
  implements ModuleFactoryInterface<AuthLocalOptionsInterface>
{
  forRoot(options: AuthLocalOptionsInterface) {
    return {
      module: AuthLocalModule,
      global: options?.global ?? false,
      imports: [
        ...(options?.imports ?? []),
        AuthLocalCoreModule.forRoot(options),
      ],
      providers: [
        AuthLocalController,
        LocalStrategy,
        {
          provide: GET_USER_SERVICE_TOKEN,
          useClass: options.getUserService,
        },
        {
          provide: ISSUE_TOKEN_SERVICE_TOKEN,
          useClass: options.issueTokenService,
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

  forRootAsync(options: AuthLocalAsyncOptionsInterface) {
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
          inject: [AUTH_LOCAL_MODULE_CONFIG_TOKEN],
          useFactory: async (asyncOptions: AuthLocalOptionsInterface) => {
            return asyncOptions.getUserService;
          },
        },
        {
          provide: ISSUE_TOKEN_SERVICE_TOKEN,
          inject: [AUTH_LOCAL_MODULE_CONFIG_TOKEN],
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

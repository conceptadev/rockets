import { Module } from '@nestjs/common';

import {
  RootAsyncDynamicModuleInterface,
  RootDynamicModuleInterface,
} from '@rockts-org/nestjs-common';

import {
  AUTHENTICATION_MODULE_CONFIG_TOKEN,
  authenticationDefaultConfig,
} from './config/authentication.config';

import {
  AuthenticationAsyncOptionsInterface,
  AuthenticationOptionsInterface,
} from './interfaces/authentication-options.interface';

@Module({
  providers: [
    {
      provide: AUTHENTICATION_MODULE_CONFIG_TOKEN,
      useValue: authenticationDefaultConfig,
    },
  ],
  exports: [AUTHENTICATION_MODULE_CONFIG_TOKEN],
})
export class AuthenticationCoreModule {
  static forRoot(
    options: AuthenticationOptionsInterface,
  ): RootDynamicModuleInterface {
    return {
      module: AuthenticationCoreModule,
      imports: options?.imports,
      providers: [
        {
          provide: AUTHENTICATION_MODULE_CONFIG_TOKEN,
          useValue: options || authenticationDefaultConfig,
        },
      ],
    };
  }

  public static forRootAsync(
    options: AuthenticationAsyncOptionsInterface,
  ): RootAsyncDynamicModuleInterface {
    return {
      module: AuthenticationCoreModule,
      imports: options?.imports,
      providers: [
        {
          provide: AUTHENTICATION_MODULE_CONFIG_TOKEN,
          inject: options?.inject,
          useFactory: options.useFactory,
        },
      ],
    };
  }
}

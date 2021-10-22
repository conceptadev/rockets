import { DynamicModule, Module } from '@nestjs/common';
import { config } from 'process';
import { AuthenticationConfigModule } from './authentication-config.module';
import { authenticationConfig, AUTHENTICATION_MODULE_CONFIG_TOKEN, CREDENTIAL_LOOKUP_SERVICE_TOKEN } from './config/authentication.config';
import { AuthenticationConfigOptionsInterface } from './interface/authentication-config-options.interface';
import { AuthenticationOptionsAsyncInterface, AuthenticationOptionsInterface } from './interface/authentication-options.interface';
import { AccessTokenInterface } from './interface/dto/access-token.interface';
import { CredentialLookupInterface } from './interface/dto/credential-lookup.interface';
import { CredentialLookupServiceInterface } from './interface/service/credential-lookup.service.interface';

import { PasswordCreationService } from './services/password-creation.service';
import { PasswordStorageService } from './services/password-storage.service';
import { PasswordStrengthService } from './services/password-strength.service';
import { SignService } from './services/sign.service';
import { SignController } from './sign.controller';


@Module({
  providers: [
    {
      provide: authenticationConfig.KEY,
      useValue: authenticationConfig(),
    },
    PasswordCreationService,
    PasswordStrengthService,
    PasswordStorageService,
    SignService,
    SignController
  ],
  exports: [
    PasswordCreationService,
    PasswordStorageService,
    PasswordStrengthService,
    SignController
  ],
  controllers: [
    SignController
  ],
})
export class AuthenticationModule {
  public static forRoot(options: AuthenticationOptionsInterface): DynamicModule {
    return {
      module: AuthenticationModule,
      providers: [
        {
          provide: AUTHENTICATION_MODULE_CONFIG_TOKEN,
          useValue: options.config || authenticationConfig(),
        },
        PasswordStrengthService,
        PasswordStorageService,
        PasswordCreationService,
        SignService,
        SignController,
        {
          provide: CREDENTIAL_LOOKUP_SERVICE_TOKEN,
          useValue: options.credentialLookupService
        }
      ],
      exports: [
        PasswordStrengthService,
        PasswordStorageService,
        PasswordCreationService,
        SignController,
        SignService
      ],
      controllers: [
          SignController,
        ],
    };
  }

  public static forRootAsync(options: AuthenticationOptionsAsyncInterface): DynamicModule {
    return {
      module: AuthenticationModule,
      imports:[...options.credentialLookupProvider?.imports],
      providers: [
        PasswordStrengthService,
        PasswordStorageService,
        PasswordCreationService,
        SignService,
        SignController,
        {
          provide: AUTHENTICATION_MODULE_CONFIG_TOKEN,
          useValue: options.config || authenticationConfig(),
        },
        {
          provide: CREDENTIAL_LOOKUP_SERVICE_TOKEN,
          inject: options.credentialLookupProvider?.inject,
          useFactory: () => {
            console.log('>>>>> INSIDER')
            return options.credentialLookupProvider?.useFactory()
          }
        }
      ],
      exports: [
        PasswordStrengthService,
        PasswordStorageService,
        PasswordCreationService,
        SignController,
        SignService
      ],
      controllers: [
          SignController,
        ],
    };
  }
}

import { DynamicModule, Module } from '@nestjs/common';
import {
  GET_USER_SERVICE_TOKEN,
  ISSUE_TOKEN_SERVICE_TOKEN,
} from './config/local-strategy.config';

import { AuthenticationModule } from '@rockts-org/nestjs-authentication';

import { LocalStrategy } from './local.strategy';
import { LocalStrategyController } from './local-strategy.controller';
import {
  localStrategyConfig,
  LOCAL_STRATEGY_MODULE_CONFIG_TOKEN,
} from './config/local-strategy.config';
import {
  LocalStrategyOptionsAsyncInterface,
  LocalStrategyOptionsInterface,
} from './interfaces/local-auth-options.interface';

/**
 * Define the Local strategy using passport
 */
@Module({
  imports: [AuthenticationModule],
  providers: [LocalStrategyController, LocalStrategy],
  exports: [LocalStrategyController],
  controllers: [LocalStrategyController],
})
export class LocalStrategyModule {
  public static forRoot(options: LocalStrategyOptionsInterface): DynamicModule {
    return {
      module: LocalStrategyModule,
      imports: options?.imports ?? [],
      providers: [
        {
          provide: LOCAL_STRATEGY_MODULE_CONFIG_TOKEN,
          useValue: options || localStrategyConfig(),
        },
        {
          provide: GET_USER_SERVICE_TOKEN,
          useClass: options.getUserService,
        },
        {
          provide: ISSUE_TOKEN_SERVICE_TOKEN,
          useClass: options.issueTokenService,
        },
      ],
    };
  }

  public static forRootAsync(
    options: LocalStrategyOptionsAsyncInterface,
  ): DynamicModule {
    return {
      module: LocalStrategyModule,
      imports: options?.imports ?? [],
      providers: [
        {
          provide: LOCAL_STRATEGY_MODULE_CONFIG_TOKEN,
          inject: options?.inject,
          useFactory: options.useFactory,
        },
        {
          provide: GET_USER_SERVICE_TOKEN,
          useClass: options.getUserService,
        },
        {
          provide: ISSUE_TOKEN_SERVICE_TOKEN,
          useClass: options.issueTokenService,
        },
      ],
    };
  }
}

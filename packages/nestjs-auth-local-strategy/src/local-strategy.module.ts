import { DynamicModule, Module } from '@nestjs/common';
import {
  GET_USER_SERVICE_TOKEN,
  ISSUE_TOKEN_SERVICE_TOKEN,
} from './config/local.config';

import { AuthenticationModule } from '@rockts-org/nestjs-authentication';
import { LocalAuthOptionsInterface } from './interfaces/local-auth-options.interface';
import { LocalStrategy } from './local.strategy';
import { LocalStrategyController } from './local-strategy.controller';

@Module({
  imports: [AuthenticationModule],
  providers: [LocalStrategyController, LocalStrategy],
  exports: [LocalStrategyController],
  controllers: [LocalStrategyController],
})
export class LocalStrategyModule {
  public static forRoot(options: LocalAuthOptionsInterface): DynamicModule {
    return {
      module: LocalStrategyModule,
      imports: options?.imports ? options.imports : [],
      providers: [
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

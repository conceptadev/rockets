import { DynamicModule, Module } from '@nestjs/common';
import { AuthenticationModule } from '@rockts-org/nestjs-authentication';
import {
  GET_USER_SERVICE_TOKEN,
  ISSUE_TOKEN_SERVICE_TOKEN,
} from './config/local.config';
import { LocalAuthOptionsInterface } from './interfaces/local-auth-options.interface';
import { LocalStrategyController } from './local-strategy.controller';
import { LocalStrategy } from './local.strategy';

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
      imports: [AuthenticationModule, ...options?.imports],
      providers: [
        LocalStrategyController,
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
      exports: [LocalStrategyController],
      controllers: [LocalStrategyController],
    };
  }
}

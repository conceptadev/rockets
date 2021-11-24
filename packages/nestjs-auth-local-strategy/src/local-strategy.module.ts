import {
  DynamicModule,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import {
  GET_USER_SERVICE_TOKEN,
  ISSUE_TOKEN_SERVICE_TOKEN,
} from './config/local.config';
import { LocalAuthOptionsInterface } from './interfaces/local-auth-options.interface';
import { LocalStrategyController } from './local-strategy.controller';
import { LocalStrategyMiddleware } from './local-strategy.middleware';
import { LocalStrategyService } from './local-strategy.service';
import { LocalStrategy } from './local.strategy';

@Module({
  imports: [],
  providers: [
    LocalStrategyController,
    //LocalStrategyService,
    LocalStrategy],
  exports: [LocalStrategyController],
  controllers: [LocalStrategyController],
})
export class LocalStrategyModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LocalStrategyMiddleware)
      .forRoutes({ path: 'auth/login', method: RequestMethod.POST });
  }

  public static forRoot(options: LocalAuthOptionsInterface): DynamicModule {
    return {
      module: LocalStrategyModule,
      imports: options?.imports,
      providers: [
        LocalStrategyController,
        LocalStrategyService,
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
      exports: [LocalStrategyController, LocalStrategyService],
      controllers: [LocalStrategyController],
    };
  }
}

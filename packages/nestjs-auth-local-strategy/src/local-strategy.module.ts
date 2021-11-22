import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { LocalStrategyController } from './local-strategy.controller';
import { LocalStrategyMiddleware } from './local-strategy.middleware';
import { LocalStrategyService } from './local-strategy.service';
import { LocalStrategy } from './local.strategy';

@Module({
  imports: [],
  providers: [LocalStrategyController, LocalStrategyService, LocalStrategy],
  exports: [LocalStrategyController],
  controllers: [LocalStrategyController],
})
export class LocalStrategyModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LocalStrategyMiddleware)
      .forRoutes({ path: 'auth/login', method: RequestMethod.POST });
  }
}

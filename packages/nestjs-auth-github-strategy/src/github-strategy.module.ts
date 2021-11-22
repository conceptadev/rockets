import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { GithubStrategyController } from './github-strategy.controller';
import { GithubStrategyMiddleware } from './github-strategy.middleware';
import { GithubStrategyService } from './github-strategy.service';
import { GithubStrategy } from './github.strategy';

@Module({
  imports: [],
  providers: [
    GithubStrategyController,
    GithubStrategyMiddleware,
    GithubStrategyService,
    GithubStrategy,
  ],
  exports: [GithubStrategyController],
  controllers: [GithubStrategyController],
})
export class GithubStrategyModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(GithubStrategyMiddleware)
      .forRoutes({ path: 'auth/github/login', method: RequestMethod.POST });
  }
}

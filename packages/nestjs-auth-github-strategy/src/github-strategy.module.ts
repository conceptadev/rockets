import { Module } from '@nestjs/common';
import { GithubStrategyController } from './github-strategy.controller';
import { GithubStrategy } from './github.strategy';

@Module({
  imports: [],
  providers: [GithubStrategyController, GithubStrategy],
  exports: [GithubStrategyController],
  controllers: [GithubStrategyController],
})
export class GithubStrategyModule {}

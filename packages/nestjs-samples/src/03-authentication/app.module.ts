import { AuthenticationModule } from '@rockts-org/nestjs-authentication';

import { EventModule } from '@rockts-org/nestjs-event';
import { IssueTokenService } from './user/issue-token.service';
import { LocalStrategyModule } from '@rockts-org/nestjs-auth-local-strategy/dist/local-strategy.module';
import { Module } from '@nestjs/common';
import { UserLookupService } from './user/user-lookup.service';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    EventModule,
    AuthenticationModule,
    LocalStrategyModule.forRoot({
      imports: [UserModule],
      getUserService: UserLookupService,
      issueTokenService: IssueTokenService,
    }),
  ],
})
export class AppModule {}

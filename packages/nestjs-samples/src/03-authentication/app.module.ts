import { AuthenticationModule } from '@rockts-org/nestjs-authentication';

import { EventModule } from '@rockts-org/nestjs-event';
import { IssueTokenService } from './user/issue-token.service';
import { Module } from '@nestjs/common';
import { UserLookupService } from './user/user-lookup.service';
import { UserModule } from './user/user.module';
import { AuthLocalModule } from '@rockts-org/nestjs-auth-local';
import { PasswordModule } from '@rockts-org/nestjs-password';

export class DummyClass {}
@Module({
  imports: [
    EventModule,
    AuthenticationModule.forRoot({
      global: true,
    }),
    AuthLocalModule.forRoot({
      imports: [
        PasswordModule.forRoot({
            minPasswordStrength: 5,
            maxPasswordAttempts: 5
        }),
        UserModule
      ],
      getUserService: UserLookupService,
      issueTokenService: IssueTokenService,
    }),
  ],
})
export class AppModule {}

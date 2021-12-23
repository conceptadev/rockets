import { AuthenticationModule } from '@rockts-org/nestjs-authentication';

import { EventModule } from '@rockts-org/nestjs-event';
import { Module } from '@nestjs/common';
import { UserModule, UserLookupService } from '@rockts-org/nestjs-user';
import { JwtModule, IssueTokenService } from '@rockts-org/nestjs-jwt';
import { AuthLocalModule } from '@rockts-org/nestjs-auth-local';
import { PasswordModule } from '@rockts-org/nestjs-password';

export class DummyClass {}
@Module({
  imports: [
    EventModule,
    AuthenticationModule.forRoot({
      global: true,
    }),
    JwtModule.forRoot({ global: true }),
    AuthLocalModule.forRoot({
      imports: [
        PasswordModule.forRoot({
          minPasswordStrength: 5,
          maxPasswordAttempts: 5,
        }),
        UserModule.forRoot({}),
      ],
      getUserService: UserLookupService,
      issueTokenService: IssueTokenService,
    }),
  ],
})
export class AppModule {}

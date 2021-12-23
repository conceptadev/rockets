import { IssueTokenService, JwtModule } from '@rockts-org/nestjs-jwt';
import { UserLookupService, UserModule } from '@rockts-org/nestjs-user';

import { AuthLocalModule } from '@rockts-org/nestjs-auth-local';
import { AuthenticationModule } from '@rockts-org/nestjs-authentication';
import { EventModule } from '@rockts-org/nestjs-event';
import { Module } from '@nestjs/common';
import { PasswordModule } from '@rockts-org/nestjs-password';

export class DummyClass {}
@Module({
  imports: [
    EventModule,
    AuthenticationModule.forRoot({
      global: true,
    }),
    JwtModule.forRoot({
      global: true,
    }),
    AuthLocalModule.forRoot({
      imports: [
        PasswordModule.forRoot({
          options: {
            minPasswordStrength: 5,
            maxPasswordAttempts: 5,
          },
        }),
        UserModule.forRoot({}),
      ],
      options: {
        getUserService: UserLookupService,
        issueTokenService: IssueTokenService,
      },
    }),
  ],
})
export class AppModule {}

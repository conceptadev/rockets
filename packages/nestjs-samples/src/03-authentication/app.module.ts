import { AuthenticationModule } from '@rockts-org/nestjs-authentication';

import { EventModule } from '@rockts-org/nestjs-event';
import { Module } from '@nestjs/common';
import { UserModule, UserLookupService } from '@rockts-org/nestjs-user';
import { JwtModule, IssueTokenService } from '@rockts-org/nestjs-jwt';
import { AuthLocalModule } from '@rockts-org/nestjs-auth-local';

export class DummyClass {}
@Module({
  imports: [
    EventModule,
    AuthenticationModule.forRoot({
      global: true,
    }),
    JwtModule.forRoot({ global: true }),
    AuthLocalModule.forRoot({
      imports: [UserModule.forRoot({})],
      getUserService: UserLookupService,
      issueTokenService: IssueTokenService,
    }),
    // AuthenticationModule.forRootAsync({
    //   global: true,
    //   useFactory: () => ({
    //     maxPasswordAttempts: 1,
    //   }),
    // }),
    // AuthLocalModule.forRootAsync({
    //   imports: [UserModule],
    //   inject: [UserLookupService, IssueTokenService],
    //   useFactory: async (
    //     a: Type<UserLookupService>,
    //     b: Type<IssueTokenService>,
    //   ) => {
    //     return {
    //       getUserService: a,
    //       issueTokenService: b,
    //     };
    //   },
    // }),
  ],
})
export class AppModule {}

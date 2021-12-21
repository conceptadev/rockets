import { AuthenticationModule } from '@rockts-org/nestjs-authentication';

import { EventModule } from '@rockts-org/nestjs-event';
import { IssueTokenService } from './user/issue-token.service';
import { Module } from '@nestjs/common';
import { UserLookupService } from './user/user-lookup.service';
import { UserModule } from './user/user.module';
import { AuthLocalModule } from '@rockts-org/nestjs-auth-local-strategy';

export class DummyClass {}
@Module({
  imports: [
    EventModule,
    AuthenticationModule.forRoot({
      global: true,
    }),
    AuthLocalModule.forRoot({
      imports: [UserModule],
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

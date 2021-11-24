import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { UserLookupService } from './user/user-lookup.service';
import {
  AuthenticationModule,
  PasswordStrengthEnum,
} from '@rockts-org/nestjs-authentication';

import { LocalStrategyModule } from '@rockts-org/nestjs-auth-local-strategy/dist/local-strategy.module';
import { IssueTokenService } from './user/issue-token.service';

@Module({
  imports: [
    UserModule,
    // AuthenticationModule.forRootAsync({
    //   imports: [UserModule],
    //   config: {
    //     inject: [authenticationConfig.KEY],
    //     useFactory: async (): Promise<AuthenticationConfigOptionsInterface> => {
    //       // overwrite config
    //       const config: AuthenticationConfigOptionsInterface = {
    //         maxPasswordAttempts: 3,
    //         minPasswordStrength: PasswordStrengthEnum.VeryStrong,
    //       };
    //       return config;
    //     },
    //   },
    // }),
    AuthenticationModule.forRoot({
      config: {
        maxPasswordAttempts: 3,
        minPasswordStrength: PasswordStrengthEnum.VeryStrong,
      },
      imports: [
        LocalStrategyModule.forRoot({
          imports: [UserModule],
          getUserService: UserLookupService,
          issueTokenService: IssueTokenService,
        }),
      ],
    }),
  ],
})
export class AppModule {}

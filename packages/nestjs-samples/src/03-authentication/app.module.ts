import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { UserLookupService } from './user/user-lookup.service';
import {
  authenticationConfig,
  AuthenticationConfigOptionsInterface,
  AuthenticationModule,
} from '@rockts-org/nestjs-authentication';
import { PasswordStrengthEnum } from '@rockts-org/nestjs-authentication/dist/enum/password-strength.enum';

@Module({
  imports: [
    UserModule,
    AuthenticationModule.forRootAsync({
      imports: [UserModule],
      credentialLookupProvider: UserLookupService,
      config: {
        inject: [authenticationConfig.KEY],
        useFactory: async (): Promise<AuthenticationConfigOptionsInterface> => {
          // overwrite config
          const config: AuthenticationConfigOptionsInterface = {
            maxPasswordAttempts: 3,
            minPasswordStrength: PasswordStrengthEnum.VeryStrong,
          };
          return config;
        },
      },
    }),
  ],
})
export class AppModule {}

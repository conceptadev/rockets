import { Module } from '@nestjs/common';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { CrudModule } from '@concepta/nestjs-crud';
import { OtpModule, OtpService } from '@concepta/nestjs-otp';
import { EmailModule, EmailService } from '@concepta/nestjs-email';
import {
  UserLookupService,
  UserModule,
  UserMutateService,
} from '@concepta/nestjs-user';

import { AuthRecoveryModule } from '../auth-recovery.module';
import { AuthRecoveryUserOtpEntityFixture } from './auth-recovery-user-otp-entity.fixture';
import { AuthRecoveryUserEntityFixture } from './auth-recovery-user-entity.fixture';

import { default as ormConfig } from './auth-recovery.ormconfig.fixture';

@Module({
  imports: [
    TypeOrmExtModule.registerAsync({
      useFactory: async () => {
        return ormConfig;
      },
    }),
    CrudModule.forRoot({}),
    AuthRecoveryModule.forRootAsync({
      inject: [UserLookupService, UserMutateService, OtpService, EmailService],
      useFactory: (
        userLookupService,
        userMutateService,
        otpService,
        emailService,
      ) => ({
        userLookupService,
        userMutateService,
        otpService,
        emailService,
      }),
    }),
    OtpModule.register({
      entities: {
        userOtp: {
          entity: AuthRecoveryUserOtpEntityFixture,
        },
      },
    }),
    UserModule.register({
      entities: {
        user: {
          entity: AuthRecoveryUserEntityFixture,
        },
      },
    }),
    EmailModule.register({}),
  ],
})
export class AuthRecoveryAppModuleFixture {}

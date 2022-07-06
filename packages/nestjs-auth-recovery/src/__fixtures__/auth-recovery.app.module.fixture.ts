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

import { default as ormConfig } from './auth-recovery.ormconfig.fixture';
import { AuthRecoveryUserRepositoryFixture } from './auth-recovery.user.repository.fixture';
import { AuthRecoveryUserOtpEntityFixture } from './auth-recovery-user-otp-entity.fixture';
import { AuthRecoveryUserOtpRepositoryFixture } from './auth-recovery-user-otp-repository.fixture';
import { AuthRecoveryUserEntityFixture } from './auth-recovery-user-entity.fixture';
import { AuthRecoveryModule } from '../auth-recovery.module';

@Module({
  imports: [
    TypeOrmExtModule.registerAsync({
      useFactory: async () => {
        return ormConfig;
      },
    }),
    CrudModule.register(),
    EmailModule.register({}),
    AuthRecoveryModule.registerAsync({
      imports: [
        UserModule.deferred(),
        OtpModule.deferred(),
        EmailModule.deferred(),
      ],
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
          repository: AuthRecoveryUserOtpRepositoryFixture,
        },
      },
    }),
    UserModule.register({
      entities: {
        user: {
          entity: AuthRecoveryUserEntityFixture,
          repository: AuthRecoveryUserRepositoryFixture,
        },
      },
    }),
    EmailModule.register({
      mailerService: {
        sendMail(): Promise<void> {
          return Promise.resolve();
        },
      },
    }),
  ],
})
export class AuthRecoveryAppModuleFixture {}

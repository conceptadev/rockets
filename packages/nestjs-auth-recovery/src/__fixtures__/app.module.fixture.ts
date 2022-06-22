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
import { default as ormConfig } from './ormconfig.fixture';
import { UserRepositoryFixture } from './user.repository.fixture';
import { UserOtpEntityFixture } from './user-otp-entity.fixture';
import { UserOtpRepositoryFixture } from './user-otp-repository.fixture';
import { UserEntityFixture } from './user.entity.fixture';
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
          entity: UserOtpEntityFixture,
          repository: UserOtpRepositoryFixture,
        },
      },
    }),
    UserModule.register({
      entities: {
        user: {
          entity: UserEntityFixture,
          repository: UserRepositoryFixture,
        },
      },
    }),
    EmailModule.register({}),
  ],
})
export class AppModuleFixture {}

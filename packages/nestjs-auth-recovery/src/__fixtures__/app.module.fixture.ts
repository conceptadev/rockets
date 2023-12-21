import { Module } from '@nestjs/common';
import { EmailModule, EmailService } from '@concepta/nestjs-email';
import { AuthenticationModule } from '@concepta/nestjs-authentication';
import { AuthJwtModule } from '@concepta/nestjs-auth-jwt';
import { JwtModule } from '@concepta/nestjs-jwt';

import { AuthRecoveryModule } from '../auth-recovery.module';

import { TypeOrmModuleFixture } from './typeorm.module.fixture';
import { OtpServiceFixture } from './otp/otp.service.fixture';
import { UserLookupServiceFixture } from './user/services/user-lookup.service.fixture';
import { UserMutateServiceFixture } from './user/services/user-mutate.service.fixture';
import { UserModuleFixture } from './user/user.module.fixture';
import { OtpModuleFixture } from './otp/otp.module.fixture';
import { MailerServiceFixture } from './email/mailer.service.fixture';

@Module({
  imports: [
    TypeOrmModuleFixture,
    JwtModule.forRoot({}),
    AuthenticationModule.forRoot({}),
    AuthJwtModule.forRootAsync({
      inject: [UserLookupServiceFixture],
      useFactory: (userLookupService: UserLookupServiceFixture) => ({
        userLookupService,
      }),
    }),
    AuthRecoveryModule.forRootAsync({
      inject: [
        EmailService,
        OtpServiceFixture,
        UserLookupServiceFixture,
        UserMutateServiceFixture,
      ],
      useFactory: (
        emailService,
        otpService,
        userLookupService,
        userMutateService,
      ) => ({
        emailService,
        otpService,
        userLookupService,
        userMutateService,
      }),
    }),
    EmailModule.forRoot({ mailerService: new MailerServiceFixture() }),
    OtpModuleFixture,
    UserModuleFixture,
  ],
})
export class AppModuleFixture {}

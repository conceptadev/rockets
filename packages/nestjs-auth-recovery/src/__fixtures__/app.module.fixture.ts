import { Module } from '@nestjs/common';
import { EmailModule, EmailService } from '@concepta/nestjs-email';

import { AuthRecoveryModule } from '../auth-recovery.module';

import { OtpServiceFixture } from './otp/otp.service.fixture';
import { UserLookupServiceFixture } from './user/services/user-lookup.service.fixture';
import { UserMutateServiceFixture } from './user/services/user-mutate.service.fixture';
import { UserModuleFixture } from './user/user.module.fixture';
import { OtpModuleFixture } from './otp/otp.module.fixture';
import { MailerServiceFixture } from './email/mailer.service.fixture';

@Module({
  imports: [
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

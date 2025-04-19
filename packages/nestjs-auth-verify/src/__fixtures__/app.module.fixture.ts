import { Module } from '@nestjs/common';
import { EmailModule, EmailService } from '@concepta/nestjs-email';
import { AuthenticationModule } from '@concepta/nestjs-authentication';
import { AuthJwtModule } from '@concepta/nestjs-auth-jwt';
import { JwtModule } from '@concepta/nestjs-jwt';

import { AuthVerifyModule } from '../auth-verify.module';

import { OtpServiceFixture } from './otp/otp.service.fixture';
import { UserModelServiceFixture } from './user/services/user-model.service.fixture';
import { UserModuleFixture } from './user/user.module.fixture';
import { OtpModuleFixture } from './otp/otp.module.fixture';
import { MailerServiceFixture } from './email/mailer.service.fixture';

@Module({
  imports: [
    JwtModule.forRoot({}),
    AuthenticationModule.forRoot({}),
    AuthJwtModule.forRootAsync({
      inject: [UserModelServiceFixture],
      useFactory: (userModelService: UserModelServiceFixture) => ({
        userModelService,
      }),
    }),
    AuthVerifyModule.forRootAsync({
      inject: [EmailService, OtpServiceFixture, UserModelServiceFixture],
      useFactory: (emailService, otpService, userModelService) => ({
        emailService,
        otpService,
        userModelService,
      }),
    }),
    EmailModule.forRoot({ mailerService: new MailerServiceFixture() }),
    OtpModuleFixture,
    UserModuleFixture,
  ],
})
export class AppModuleFixture {}

import { Module } from '@nestjs/common';
import { EmailModule, EmailService } from '@concepta/nestjs-email';
import { AuthJwtModule } from '@concepta/nestjs-auth-jwt';

import { TypeOrmModuleFixture } from './typeorm.module.fixture';
import { OtpServiceFixture } from './otp/otp.service.fixture';
import { UserLookupServiceFixture } from './user/services/user-lookup.service.fixture';
import { UserMutateServiceFixture } from './user/services/user-mutate.service.fixture';
import { UserModuleFixture } from './user/user.module.fixture';
import { OtpModuleFixture } from './otp/otp.module.fixture';
import { MailerServiceFixture } from './email/mailer.service.fixture';
import { JwtModule } from '../jwt/jwt.module';
import { AuthenticationModule } from '../authentication.module';
import { AuthVerifyModule } from '../verify/auth-verify.module';

@Module({
  imports: [
    TypeOrmModuleFixture,
    JwtModule.forRoot({}),
    AuthenticationModule.forRoot({}),
    // TODO: review why this break tests but it passes without
    // AuthJwtModule.forRootAsync({
    //   inject: [UserLookupServiceFixture],
    //   useFactory: (userLookupService: UserLookupServiceFixture) => ({
    //     userLookupService,
    //   }),
    // }),
    AuthVerifyModule.forRootAsync({
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

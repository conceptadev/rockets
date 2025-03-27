import { Module } from '@nestjs/common';

import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { CrudModule } from '@concepta/nestjs-crud';
import { PasswordModule } from '@concepta/nestjs-password';
import { AuthenticationModule } from '@concepta/nestjs-authentication';
import { JwtModule } from '@concepta/nestjs-authentication';
import { AuthJwtModule } from '@concepta/nestjs-auth-jwt';
import { OtpModule, OtpService } from '@concepta/nestjs-otp';
import { EmailModule, EmailService } from '@concepta/nestjs-email';
import {
  UserLookupService,
  UserModule,
  UserMutateService,
} from '@concepta/nestjs-user';

import { AuthVerifyModule } from '../auth-verify.module';
import { UserOtpEntityFixture } from './user/entities/user-otp-entity.fixture';
import { UserEntityFixture } from './user/entities/user-entity.fixture';

import { default as ormConfig } from './ormconfig.fixture';
import { MailerServiceFixture } from './email/mailer.service.fixture';

@Module({
  imports: [
    TypeOrmExtModule.forRoot(ormConfig),
    CrudModule.forRoot({}),
    JwtModule.forRoot({}),
    AuthenticationModule.forRoot({
      settings: {
        disableGuard: (context, guard) =>
          guard.constructor.name === 'AuthJwtGuard' &&
          context.getClass().name === 'UserController',
      },
    }),
    AuthJwtModule.forRootAsync({
      inject: [UserLookupService],
      useFactory: (userLookupService: UserLookupService) => ({
        userLookupService,
      }),
    }),
    AuthVerifyModule.forRootAsync({
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
    OtpModule.forRoot({
      entities: {
        userOtp: {
          entity: UserOtpEntityFixture,
        },
      },
    }),
    PasswordModule.forRoot({}),
    UserModule.forRoot({
      entities: {
        user: {
          entity: UserEntityFixture,
        },
      },
    }),
    EmailModule.forRoot({
      mailerService: new MailerServiceFixture(),
    }),
  ],
})
export class AppModuleDbFixture {}

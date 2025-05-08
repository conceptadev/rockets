import { Module } from '@nestjs/common';

import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { CrudModule } from '@concepta/nestjs-crud';
import { PasswordModule } from '@concepta/nestjs-password';
import { AuthenticationModule } from '@concepta/nestjs-authentication';
import { JwtModule } from '@concepta/nestjs-jwt';
import { AuthJwtModule } from '@concepta/nestjs-auth-jwt';
import { OtpModule, OtpService } from '@concepta/nestjs-otp';
import { EmailModule, EmailService } from '@concepta/nestjs-email';
import {
  UserModelService,
  UserModelServiceInterface,
  UserModule,
  UserPasswordService,
} from '@concepta/nestjs-user';

import { AuthRecoveryModule } from '../auth-recovery.module';
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
      inject: [UserModelService],
      useFactory: (userModelService: UserModelServiceInterface) => ({
        userModelService,
      }),
    }),
    AuthRecoveryModule.forRootAsync({
      inject: [UserModelService, UserPasswordService, OtpService, EmailService],
      useFactory: (
        userModelService,
        userPasswordService,
        otpService,
        emailService,
      ) => ({
        userModelService,
        userPasswordService,
        otpService,
        emailService,
      }),
    }),
    OtpModule.forRootAsync({
      useFactory: () => ({}),
      entities: ['userOtp'],
      imports: [
        TypeOrmExtModule.forFeature({
          userOtp: {
            entity: UserOtpEntityFixture,
          },
        }),
      ],
    }),
    PasswordModule.forRoot({}),
    UserModule.forRootAsync({
      imports: [
        TypeOrmExtModule.forFeature({
          user: {
            entity: UserEntityFixture,
          },
        }),
      ],
    }),
    EmailModule.forRoot({
      mailerService: new MailerServiceFixture(),
    }),
  ],
})
export class AppModuleDbFixture {}

import { Logger, Module } from '@nestjs/common';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { CrudModule } from '@concepta/nestjs-crud';
import { OtpModule, OtpService } from '@concepta/nestjs-otp';
import { EmailModule, EmailService } from '@concepta/nestjs-email';
import { UserModelService, UserModule } from '@concepta/nestjs-user';
import { EmailSendOptionsInterface } from '@concepta/nestjs-common';
import { EventModule } from '@concepta/nestjs-event';
import { PasswordModule } from '@concepta/nestjs-password';
import { MailerModule, MailerService } from '@nestjs-modules/mailer';

import { InvitationModule } from '../invitation.module';
import { InvitationEntityFixture } from './invitation/entities/invitation.entity.fixture';
import { InvitationAcceptedEventAsync } from '../events/invitation-accepted.event';
import { UserOtpEntityFixture } from './user/entities/user-otp.entity.fixture';
import { UserEntityFixture } from './user/entities/user.entity.fixture';
import { default as ormConfig } from './ormconfig.fixture';

@Module({
  imports: [
    EventModule.forRoot({}),
    TypeOrmExtModule.forRoot(ormConfig),
    CrudModule.forRoot({}),
    MailerModule.forRoot({ transport: { host: '' } }),
    EmailModule.forRootAsync({
      inject: [MailerService],
      useFactory: (mailerService: MailerService) => ({ mailerService }),
    }),
    InvitationModule.registerAsync({
      inject: [UserModelService, OtpService, EmailService],
      useFactory: (userModelService, otpService, emailService) => ({
        userModelService,
        otpService,
        emailService,
      }),
      entities: {
        invitation: {
          entity: InvitationEntityFixture,
        },
      },
    }),
    OtpModule.forRoot({
      entities: {
        'user-otp': {
          entity: UserOtpEntityFixture,
        },
      },
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
      useFactory: () => ({
        settings: {
          invitationAcceptedEvent: InvitationAcceptedEventAsync,
        },
      }),
    }),
    EmailModule.register({
      mailerService: {
        sendMail(sendMailOptions: EmailSendOptionsInterface): Promise<void> {
          Logger.debug('email sent', sendMailOptions);

          return Promise.resolve();
        },
      },
    }),
  ],
  providers: [
    {
      provide: Logger,
      useValue: {
        log: jest.fn(),
        debug: jest.fn(async (arg1, arg2) => {
          return { arg1, arg2 };
        }),
      },
    },
  ],
})
export class AppModuleFixture {}

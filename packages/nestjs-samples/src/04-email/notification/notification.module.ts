import { Module } from '@nestjs/common';
import { MailerModule, MailerService } from '@nestjs-modules/mailer';
import { EmailModule } from '@concepta/nestjs-email';
import { NotificationController } from './notification.controller';

@Module({
  imports: [
    MailerModule.forRoot({ transport: { host: '' } }),
    EmailModule.forRootAsync({
      inject: [MailerService],
      useFactory: (mailerService: MailerService) => ({ mailerService }),
    }),
  ],
  controllers: [NotificationController],
})
export class NotificationModule {}

import { Logger, Module } from '@nestjs/common';
import { EmailService } from '@rockts-org/nestjs-email';
import { NotificationController } from './notification.controller';

@Module({
  controllers: [NotificationController],
  providers: [Logger, EmailService],
})
export class NotificationModule {}

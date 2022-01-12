import { Logger, Module } from '@nestjs/common';
import { EmailService } from '@rockts-org/nestjs-email';
import { NotificationController } from './notification.controller';
import { EmailModule } from '@rockts-org/nestjs-email';

@Module({
  imports: [EmailModule.register({})],
  controllers: [NotificationController],
  providers: [Logger, EmailService],
})
export class NotificationModule {}

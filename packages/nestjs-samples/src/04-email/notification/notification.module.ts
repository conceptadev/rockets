import { Logger, Module } from '@nestjs/common';
import { EmailService } from '@concepta/nestjs-email';
import { NotificationController } from './notification.controller';
import { EmailModule } from '@concepta/nestjs-email';

@Module({
  imports: [EmailModule.register({})],
  controllers: [NotificationController],
  providers: [Logger, EmailService],
})
export class NotificationModule {}

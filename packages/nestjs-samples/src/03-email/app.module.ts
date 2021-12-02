import { Module } from '@nestjs/common';
import { NotificationModule } from './notification/notification.module';
import { EmailModule } from '@rockts-org/nestjs-email';

@Module({
  imports: [EmailModule, NotificationModule],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { NotificationModule } from './notification/notification.module';
import { EmailModule } from '@rockts-org/nestjs-email';
import { emailConfig } from './config/email.config';
import { ConfigType } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [emailConfig],
    }),
    EmailModule.forRootAsync({
      inject: [emailConfig.KEY],
      useFactory: async (config: ConfigType<typeof emailConfig>) => {
        return config;
      },
    }),
    NotificationModule,
  ],
})
export class AppModule {}

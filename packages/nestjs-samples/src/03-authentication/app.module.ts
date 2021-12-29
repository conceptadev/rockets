import { AuthLocalModule } from '@rockts-org/nestjs-auth-local';
import { AuthenticationModule } from '@rockts-org/nestjs-authentication';
import { EventModule } from '@rockts-org/nestjs-event';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    EventModule,
    AuthenticationModule.register(),
    AuthLocalModule.register(),
  ],
})
export class AppModule {}

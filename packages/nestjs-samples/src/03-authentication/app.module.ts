import { AuthLocalModule } from '@rockts-org/nestjs-auth-local';
import { AuthenticationModule } from '@rockts-org/nestjs-authentication';
import { Module } from '@nestjs/common';
import { EventModule } from '@rockts-org/nestjs-event';

@Module({
  imports: [
    AuthenticationModule.register(),
    AuthLocalModule.register(),
    EventModule.register(),
  ],
})
export class AppModule {}

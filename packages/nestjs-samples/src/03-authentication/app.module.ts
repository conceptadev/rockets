import { AuthLocalModule } from '@rockts-org/nestjs-auth-local';
import { AuthenticationModule } from '@rockts-org/nestjs-authentication';
import { Module } from '@nestjs/common';

@Module({
  imports: [AuthenticationModule.register(), AuthLocalModule.register()],
})
export class AppModule {}

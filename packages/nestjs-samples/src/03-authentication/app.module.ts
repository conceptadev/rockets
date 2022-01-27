import { Module } from '@nestjs/common';
import { AuthLocalModule } from '@rockts-org/nestjs-auth-local';
import { AuthJwtModule } from '@rockts-org/nestjs-auth-jwt';
import { AuthenticationModule } from '@rockts-org/nestjs-authentication';
import { UserModule } from '@rockts-org/nestjs-user';
import { JwtModule } from '@rockts-org/nestjs-jwt';
import { PasswordModule } from '@rockts-org/nestjs-password';
import { CustomUserController } from './user/user.controller';

@Module({
  imports: [
    AuthLocalModule.register(),
    AuthJwtModule.register(),
    AuthenticationModule.register(),
    JwtModule.register(),
    PasswordModule.register(),
    UserModule.register(),
  ],
  //providers: [CustomUserController],
  controllers: [CustomUserController],
})
export class AppModule {}

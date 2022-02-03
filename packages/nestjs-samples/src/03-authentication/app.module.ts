import { Module } from '@nestjs/common';
import { AuthLocalModule } from '@rockts-org/nestjs-auth-local';
import { AuthJwtModule } from '@rockts-org/nestjs-auth-jwt';
import { AuthenticationModule } from '@rockts-org/nestjs-authentication';
import { UserModule } from '@rockts-org/nestjs-user';
import { JwtModule } from '@rockts-org/nestjs-jwt';
import { PasswordModule } from '@rockts-org/nestjs-password';
import { CrudModule } from '@rockts-org/nestjs-crud';
import { CustomUserController } from './user/user.controller';

@Module({
  imports: [
    AuthLocalModule.register(),
    AuthJwtModule.register(),
    AuthenticationModule.register(),
    JwtModule.register(),
    PasswordModule.register(),
    CrudModule.register(),
    UserModule.register(),
  ],
  controllers: [CustomUserController],
})
export class AppModule {}

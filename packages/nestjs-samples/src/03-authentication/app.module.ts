import { Module } from '@nestjs/common';
import { AuthLocalModule } from '@rockts-org/nestjs-auth-local';
import { AuthenticationModule } from '@rockts-org/nestjs-authentication';
import { UserModule } from '@rockts-org/nestjs-user';
import { JwtModule } from '@rockts-org/nestjs-jwt';
import { PasswordModule } from '@rockts-org/nestjs-password';
import { CrudModule } from '@rockts-org/nestjs-crud';

@Module({
  imports: [
    AuthLocalModule.register(),
    AuthenticationModule.register(),
    JwtModule.register(),
    PasswordModule.register(),
    CrudModule.register(),
    UserModule.register(),
  ],
})
export class AppModule {}

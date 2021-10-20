import { Module } from '@nestjs/common';
import { AuthenticationConfigModule } from './authentication-config.module';
import { PasswordCreationService } from './services/password-creation.service';
import { PasswordStorageService } from './services/password-storage.service';
import { PasswordStrengthService } from './services/password-strength.service';
import { SignController } from './sign.controller';

@Module({
  imports: [AuthenticationConfigModule.forRoot({})],
  providers: [
    PasswordCreationService,
    PasswordStorageService,
    PasswordStrengthService
  ],
  exports: [PasswordCreationService,
    PasswordStorageService,
    PasswordStrengthService],
  controllers: [SignController],
})
export class NestjsAuthenticationModule {}

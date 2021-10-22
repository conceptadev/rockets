import { Module } from '@nestjs/common';
import { AuthenticationConfigModule } from './authentication-config.module';
import { authenticationConfig } from './config/authentication.config';
import { PasswordCreationService } from './services/password-creation.service';
import { PasswordStorageService } from './services/password-storage.service';
import { PasswordStrengthService } from './services/password-strength.service';
import { SignService } from './services/sign.service';
import { SignController } from './sign.controller';
@Module({
  imports: [
    AuthenticationConfigModule.forRoot(null)
  ], 
  providers: [
    PasswordCreationService,
    PasswordStorageService,
    PasswordStrengthService,
    SignService,
  ],
  exports: [
    PasswordCreationService,
    PasswordStorageService,
    PasswordStrengthService,
  ],
  controllers: [
    SignController
  ],
})
export class AuthenticationModule {}

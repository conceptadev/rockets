import { Module } from '@nestjs/common';
import { AuthenticationConfigModule } from './authentication-config.module';
import { PasswordCreationService } from './password-creation.service';
import { PasswordStorageService } from './password-storage.service';
import { PasswordStrengthService } from './password-strength.service';
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

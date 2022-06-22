import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthRecoveryService } from './auth-recovery.service';

@Controller('auth/recovery')
@ApiTags('auth-recovery')
export class AuthRecoveryController {
  constructor(private readonly authRecoveryService: AuthRecoveryService) {}
}

import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthRecoveryService } from './services/auth-recovery.service';
import { RecoverPasswordDto } from './dto/recover-password.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthRecoveryController {
  constructor(private readonly authRecoveryService: AuthRecoveryService) {}

  @ApiOperation({
    summary:
      'Recover account email password by providing an email that will receive a password reset link.',
  })
  @ApiBody({
    type: RecoverPasswordDto,
    description: 'DTO of email recover.',
  })
  @Post('/recover-password')
  async recoverPassword(
    @Body() recoverPasswordDto: RecoverPasswordDto,
  ): Promise<void> {
    // eslint-disable-next-line no-useless-catch
    try {
      await this.authRecoveryService.recoverPassword(recoverPasswordDto.email);
    } catch (e) {
      throw e;
    }
  }
}

import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthRecoveryService } from './services/auth-recovery.service';
import { RecoverPasswordDto } from './dto/recover-password.dto';
import { RecoverLoginDto } from './dto/recover-login.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthRecoveryController {
  constructor(private readonly authRecoveryService: AuthRecoveryService) {}

  @ApiOperation({
    summary:
      'Recover account username password by providing an email that will receive an username.',
  })
  @ApiBody({
    type: RecoverLoginDto,
    description: 'DTO of login recover.',
  })
  @Post('/recover-login')
  async recoverLogin(@Body() recoverLoginDto: RecoverLoginDto): Promise<void> {
    await this.authRecoveryService.recoverLogin(recoverLoginDto.email);
  }

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
    await this.authRecoveryService.recoverPassword(recoverPasswordDto.email);
  }

  @ApiOperation({
    summary: 'Update lost password by providing passcode and new password.',
  })
  @ApiBody({
    type: UpdatePasswordDto,
    description: 'DTO of update password.',
  })
  @Post('/update-password')
  async updatePassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<void> {
    const { passcode, newPassword } = updatePasswordDto;
    await this.authRecoveryService.updatePassword(passcode, newPassword);
  }
}

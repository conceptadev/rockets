import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthRecoveryService } from './services/auth-recovery.service';
import { AuthRecoveryRecoverPasswordDto } from './dto/auth-recovery-recover-password.dto';
import { AuthRecoveryRecoverLoginDto } from './dto/auth-recovery-recover-login.dto';
import { AuthRecoveryUpdatePasswordDto } from './dto/auth-recovery-update-password.dto';

@Controller('auth/recovery')
@ApiTags('auth')
export class AuthRecoveryController {
  constructor(private readonly authRecoveryService: AuthRecoveryService) {}

  @ApiOperation({
    summary:
      'Recover account username password by providing an email that will receive an username.',
  })
  @ApiBody({
    type: AuthRecoveryRecoverLoginDto,
    description: 'DTO of login recover.',
  })
  @Post('/login')
  async recoverLogin(
    @Body() recoverLoginDto: AuthRecoveryRecoverLoginDto,
  ): Promise<void> {
    await this.authRecoveryService.recoverLogin(recoverLoginDto.email);
  }

  @ApiOperation({
    summary:
      'Recover account email password by providing an email that will receive a password reset link.',
  })
  @ApiBody({
    type: AuthRecoveryRecoverPasswordDto,
    description: 'DTO of email recover.',
  })
  @Post('/password')
  async recoverPassword(
    @Body() recoverPasswordDto: AuthRecoveryRecoverPasswordDto,
  ): Promise<void> {
    await this.authRecoveryService.recoverPassword(recoverPasswordDto.email);
  }

  @ApiOperation({
    summary: 'Check if passcode is valid.',
  })
  @Get('/passcode/:passcode')
  async validatePasscode(@Param('passcode') passcode: string): Promise<void> {
    const otp = await this.authRecoveryService.validatePasscode(passcode);

    if (!otp) {
      throw new NotFoundException();
    }
  }

  @ApiOperation({
    summary: 'Update lost password by providing passcode and new password.',
  })
  @ApiBody({
    type: AuthRecoveryUpdatePasswordDto,
    description: 'DTO of update password.',
  })
  @Patch('/password')
  async updatePassword(
    @Body() updatePasswordDto: AuthRecoveryUpdatePasswordDto,
  ): Promise<void> {
    const { passcode, newPassword } = updatePasswordDto;

    const user = await this.authRecoveryService.updatePassword(
      passcode,
      newPassword,
    );

    if (!user) {
      // the client should have checked using validate passcode first
      throw new BadRequestException();
    }
  }
}

import { AuthPublic } from '../../core/decorators/auth-public.decorator';
import { Body, Controller, Patch, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthVerifyUpdateDto } from '../dto/auth-verify-update.dto';
import { AuthVerifyDto } from '../dto/auth-verify.dto';
import { AuthVerifyService } from '../services/auth-verify.service';
import { AuthRecoveryOtpInvalidException } from '../exceptions/auth-verify-otp-invalid.exception';

@Controller('auth/verify')
@AuthPublic()
@ApiTags('auth')
export class AuthVerifyController {
  constructor(private readonly authVerifyService: AuthVerifyService) {}

  @ApiOperation({
    summary:
      'Send Verify account email by providing an email that will receive link to confirm account.',
  })
  @ApiBody({
    type: AuthVerifyDto,
    description: 'DTO of email verify.',
  })
  @ApiOkResponse()
  @Post('/send')
  async send(@Body() verifyPasswordDto: AuthVerifyDto): Promise<void> {
    await this.authVerifyService.send({ email: verifyPasswordDto.email });
  }

  @ApiOperation({
    summary: 'confirm email providing passcode.',
  })
  @ApiBody({
    type: AuthVerifyUpdateDto,
    description: 'DTO of update password.',
  })
  @ApiOkResponse()
  @ApiBadRequestResponse()
  @Patch('/confirm')
  async confirm(@Body() updatePasswordDto: AuthVerifyUpdateDto): Promise<void> {
    const { passcode } = updatePasswordDto;

    const user = await this.authVerifyService.confirmUser({ passcode });

    if (!user) {
      // the client should have checked using validate passcode first
      throw new AuthRecoveryOtpInvalidException();
    }
  }
}

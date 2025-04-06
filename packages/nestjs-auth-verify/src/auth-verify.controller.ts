import { AuthPublic } from '@concepta/nestjs-authentication';
import { Body, Controller, Patch, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthVerifyUpdateDto } from './dto/auth-verify-update.dto';
import { AuthVerifyDto } from './dto/auth-verify.dto';
import { AuthVerifyService } from './services/auth-verify.service';

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
  async send(@Body() authVerifyDto: AuthVerifyDto): Promise<void> {
    await this.authVerifyService.send({ email: authVerifyDto.email });
  }

  @ApiOperation({
    summary: 'confirm email providing passcode.',
  })
  @ApiBody({
    type: AuthVerifyUpdateDto,
    description: 'DTO of verify email.',
  })
  @ApiOkResponse()
  @ApiBadRequestResponse()
  @Patch('/confirm')
  async confirm(
    @Body() authVerifyUpdateDto: AuthVerifyUpdateDto,
  ): Promise<void> {
    const { passcode } = authVerifyUpdateDto;

    await this.authVerifyService.confirmUser({ passcode });
  }
}

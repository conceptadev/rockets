import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InvitationService } from './services/invitation.service';
import { InvitationDto } from './dto/invitation.dto';
import { InvitationAcceptInviteDto } from './dto/invitation-accept-invite.dto';

@Controller('invitation')
@ApiTags('invitation')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @ApiOperation({
    summary: 'Invite an new user to the app.',
  })
  @ApiBody({
    type: InvitationDto,
    description: 'DTO of invitation.',
  })
  @Post('/invite')
  async sendInvite(@Body() invitationDto: InvitationDto): Promise<void> {
    await this.invitationService.sendInvite(invitationDto.email);
  }

  @ApiOperation({
    summary: 'Check if passcode is valid.',
  })
  @Get('/passcode/:passcode')
  async validatePasscode(@Param('passcode') passcode: string): Promise<void> {
    const otp = await this.invitationService.validatePasscode(passcode);

    if (!otp) {
      throw new NotFoundException();
    }
  }

  @ApiOperation({
    summary: 'Accept invitation token to activate the user.',
  })
  @ApiBody({
    type: InvitationAcceptInviteDto,
    description: 'DTO to accept invitation token.',
  })
  @Patch('/invite')
  async acceptInvite(
    @Body() invitationAcceptInviteDto: InvitationAcceptInviteDto,
  ): Promise<void> {
    const { passcode, newPassword } = invitationAcceptInviteDto;

    const user = await this.invitationService.acceptInvite(
      passcode,
      newPassword,
    );

    if (!user) {
      // the client should have checked using validate passcode first
      throw new BadRequestException();
    }
  }

  @ApiOperation({
    summary: 'Revoke all invitation user token.',
  })
  @ApiBody({
    type: InvitationDto,
    description: 'DTO to revoke all invitation user token.',
  })
  @Delete('/invite')
  async revokeAllUserInvites(
    @Body() invitationDto: InvitationDto,
  ): Promise<void> {
    await this.invitationService.revokeAllUserInvites(invitationDto.email);
  }
}

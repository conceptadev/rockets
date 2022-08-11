import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

import { InvitationAcceptanceService } from '../services/invitation-acceptance.service';
import { InvitationAcceptInviteDto } from '../dto/invitation-accept-invite.dto';

@Controller('invitation-acceptance')
@ApiTags('invitation-acceptance')
export class InvitationAcceptanceController {
  constructor(
    private readonly invitationAcceptanceService: InvitationAcceptanceService,
  ) {}

  @ApiBody({
    type: InvitationAcceptInviteDto,
    description: 'DTO to accept invitation token.',
  })
  @ApiOperation({
    summary: 'Accept one invitation by code, passcode and payload.',
  })
  @Patch('/:code')
  async acceptInvite(
    @Param('code') code: string,
    @Body() invitationAcceptInviteDto: InvitationAcceptInviteDto,
  ): Promise<void> {
    const { passcode, payload } = invitationAcceptInviteDto;

    const invitation = await this.invitationAcceptanceService.getOneByCode(
      code,
    );

    if (!invitation) {
      throw new NotFoundException();
    }

    const success = await this.invitationAcceptanceService.accept(
      invitation,
      passcode,
      payload,
    );

    if (!success) {
      // the client should have checked using validate passcode first
      throw new BadRequestException();
    }
  }

  @ApiOperation({
    summary: 'Check if passcode is valid.',
  })
  @Get('/:code')
  async validatePasscode(
    @Param('code') code: string,
    @Query('passcode') passcode: string,
  ): Promise<void> {
    const invitation = await this.invitationAcceptanceService.getOneByCode(
      code,
    );

    if (!invitation) {
      throw new NotFoundException();
    }

    const { category } = invitation;
    const otp = await this.invitationAcceptanceService.validatePasscode(
      passcode,
      category,
      false,
    );

    if (!otp) {
      throw new NotFoundException();
    }
  }
}

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
import {
  ReferenceAssigneeInterface,
  ReferenceIdInterface,
} from '@concepta/ts-core';

import { InvitationAcceptanceService } from '../services/invitation-acceptance.service';
import { InvitationAcceptInviteDto } from '../dto/invitation-accept-invite.dto';
import { InvitationDto } from '../dto/invitation.dto';

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
    let invitation: InvitationDto | null | undefined;
    try {
      invitation = await this.invitationAcceptanceService.getOneByCode(code);
    } catch (e) {
      console.error(e);
    }

    if (!invitation) {
      throw new NotFoundException();
    }

    let success: boolean | null | undefined;
    try {
      success = await this.invitationAcceptanceService.accept(
        invitation,
        passcode,
        payload,
      );
    } catch (e) {
      console.error(e);
    }

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
    let invitation: InvitationDto | null | undefined;
    try {
      invitation = await this.invitationAcceptanceService.getOneByCode(code);
    } catch (e) {
      console.error(e);
    }

    if (!invitation) {
      throw new NotFoundException();
    }

    const { category } = invitation;
    let otp:
      | ReferenceAssigneeInterface<ReferenceIdInterface<string>>
      | null
      | undefined;
    try {
      otp = await this.invitationAcceptanceService.validatePasscode(
        passcode,
        category,
        false,
      );
    } catch (e) {
      console.error(e);
    }

    if (!otp) {
      throw new NotFoundException();
    }
  }
}

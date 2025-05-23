import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Patch,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { InvitationAcceptanceService } from '../../services/invitation-acceptance.service';
import { InvitationAcceptInviteDto } from '../../dto/invitation-accept-invite.dto';
import { InvitationNotAcceptedException } from '../../exceptions/invitation-not-accepted.exception';

@Controller('invitation-acceptance')
@ApiTags('invitation-acceptance')
export class InvitationAcceptanceController {
  constructor(
    private readonly invitationAcceptanceService: InvitationAcceptanceService,
  ) {}

  @UsePipes(new ValidationPipe({ transform: true, forbidUnknownValues: true }))
  @ApiBody({
    type: InvitationAcceptInviteDto,
    description: 'DTO to accept invitation token.',
  })
  @ApiOperation({
    summary: 'Accept one invitation by code, passcode and payload.',
  })
  @ApiOkResponse()
  @Patch('/:code')
  async acceptInvite(
    @Param('code') code: string,
    @Body() invitationAcceptInviteDto: InvitationAcceptInviteDto,
  ): Promise<void> {
    const { passcode, payload } = invitationAcceptInviteDto;

    let success: boolean | null | undefined;

    try {
      success = await this.invitationAcceptanceService.accept({
        code,
        passcode,
        payload,
      });
    } catch (e) {
      Logger.error(e);
    }

    if (!success) {
      // the client should have checked using validate passcode first
      throw new InvitationNotAcceptedException();
    }
  }

  @ApiOperation({
    summary: 'Check if passcode is valid.',
  })
  @ApiOkResponse()
  @Get('/:code')
  async validatePasscode(
    @Param('code') code: string,
    @Query('passcode') passcode: string,
  ): Promise<void> {
    await this.invitationAcceptanceService.validate(code, passcode);
  }
}

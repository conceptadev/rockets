import {
  Controller,
  Logger,
  NotFoundException,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { InvitationAcceptanceService } from '../services/invitation-acceptance.service';
import { InvitationDto } from '../dto/invitation.dto';
import { InvitationSendService } from '../services/invitation-send.service';

@Controller('invitation-resend')
@ApiTags('invitation-resend')
export class InvitationResendController {
  constructor(
    private readonly invitationAcceptanceService: InvitationAcceptanceService,
    private readonly invitationSendService: InvitationSendService,
  ) {}

  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({
    summary: 'resend one invitation by code',
  })
  @Post('/:code')
  async resendInvite(@Param('code') code: string): Promise<void> {
    let invitation: InvitationDto | null | undefined;

    try {
      invitation = await this.invitationAcceptanceService.getOneByCode(code);
    } catch (e: unknown) {
      Logger.error(e);
    }

    if (!invitation) {
      throw new NotFoundException();
    }

    const { category, user, email } = invitation;

    await this.invitationSendService.send({ ...user, email }, code, category);
  }
}

import {
  Controller,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { InvitationAttemptService } from '../../services/invitation-attempt.service';

@Controller('invitation-reattempt')
@ApiTags('invitation-reattempt')
export class InvitationReattemptController {
  constructor(
    private readonly invitationAttemptService: InvitationAttemptService,
  ) {}

  @UsePipes(new ValidationPipe({ transform: true, forbidUnknownValues: true }))
  @ApiOperation({
    summary: 'Reattempt one invitation by code',
  })
  @ApiOkResponse()
  @Post('/:code')
  async reattemptInvite(@Param('code') code: string): Promise<void> {
    await this.invitationAttemptService.send(code);
  }
}

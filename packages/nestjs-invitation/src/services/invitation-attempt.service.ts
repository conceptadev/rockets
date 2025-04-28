import { Injectable, Logger } from '@nestjs/common';
import { InvitationAcceptanceService } from './invitation-acceptance.service';
import { InvitationSendService } from './invitation-send.service';
import { InvitationAttemptServiceInterface } from '../interfaces/services/invitation-attempt-service.interface';
import { InvitationNotFoundException } from '../exceptions/invitation-not-found.exception';
import { InvitationInterface } from '@concepta/nestjs-common';

@Injectable()
export class InvitationAttemptService
  implements InvitationAttemptServiceInterface
{
  constructor(
    private readonly invitationAcceptanceService: InvitationAcceptanceService,
    private readonly invitationSendService: InvitationSendService,
  ) {}

  async send(code: string): Promise<void> {
    let invitation: InvitationInterface | null | undefined;

    try {
      invitation = await this.invitationAcceptanceService.getOneByCode(code);
    } catch (e: unknown) {
      Logger.error(e);
    }

    if (!invitation) {
      throw new InvitationNotFoundException();
    }

    const { id, category, userId } = invitation;

    await this.invitationSendService.send({
      id,
      userId,
      code,
      category,
    });
  }
}

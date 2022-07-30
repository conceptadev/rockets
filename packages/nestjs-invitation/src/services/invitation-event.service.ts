import { InvitationDto } from '../dto/invitation.dto';
import { LiteralObject } from '@concepta/ts-core';

export class InvitationEventService {
  // TODO implement eventService
  async sendEvent(
    eventName: string,
    invitationDto: InvitationDto,
    payload?: LiteralObject,
  ): Promise<boolean> {
    return true;
  }
}

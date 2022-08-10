import { LiteralObject } from '@concepta/ts-core';
import { Inject } from '@nestjs/common';
import { EventDispatchService } from '@concepta/nestjs-event';

import { InvitationDto } from '../dto/invitation.dto';
import { InvitationAcceptedEventAsync } from '../events/invitation-accepted.event';

export class InvitationEventService {
  constructor(
    @Inject(EventDispatchService)
    private eventDispatchService: EventDispatchService,
  ) {}

  async sendEvent(
    invitationDto: InvitationDto,
    payload?: LiteralObject,
  ): Promise<boolean> {
    const invitationAcceptedEventAsync = new InvitationAcceptedEventAsync({
      ...invitationDto,
      data: payload,
    });
    const eventResult = await this.eventDispatchService.async(
      invitationAcceptedEventAsync,
    );

    return eventResult.some((it) => it === true);
  }
}

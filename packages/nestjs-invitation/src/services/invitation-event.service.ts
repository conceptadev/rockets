import { randomUUID } from 'crypto';
import { LiteralObject } from '@concepta/ts-core';
import { Inject } from '@nestjs/common';
import { EventDispatchService } from '@concepta/nestjs-event';
import { InvitationDto } from '../dto/invitation.dto';
import { InvitationSignupEventAsync } from '../events/invitation-created.event';

export class InvitationEventService {
  constructor(
    @Inject(EventDispatchService)
    private eventDispatchService: EventDispatchService,
  ) {}

  // TODO implement eventService
  async sendEvent(
    eventName: string,
    invitationDto: InvitationDto,
    payload?: LiteralObject,
  ): Promise<boolean> {
    const id = randomUUID();
    const invitationCreatedEventAsync = new InvitationSignupEventAsync({
      id,
      payload,
    });
    const eventResult = await this.eventDispatchService.async(
      invitationCreatedEventAsync,
    );

    const flattedEventResult = eventResult.flat();
    const result = flattedEventResult.find((event) => event.id === id);

    if (result?.error || !result?.processed || !result?.successfully) {
      throw result?.error ?? new Error('Unknown error');
    }

    return result?.successfully;
  }
}

import {
  EventAsyncInterface,
  EventListenerOn,
  EventListenService,
} from '@concepta/nestjs-event';
import { InvitationAcceptedRequestEventPayloadInterface } from '@concepta/ts-common';
import {
  EventInstance,
  EventReturnType,
} from '@concepta/nestjs-event/dist/event-types';
import { Inject, Injectable, OnModuleInit, Optional } from '@nestjs/common';

import { USER_MODULE_SETTINGS_TOKEN } from '../user.constants';
import { UserMutateService } from '../services/user-mutate.service';
import { UserSettingsInterface } from '../interfaces/user-settings.interface';
import { UserLookupService } from '../services/user-lookup.service';

@Injectable()
export class CreateUserListener
  extends EventListenerOn<
    EventAsyncInterface<InvitationAcceptedRequestEventPayloadInterface, boolean>
  >
  implements OnModuleInit
{
  constructor(
    private userLookupService: UserLookupService,
    private userMutateService: UserMutateService,
    @Inject(USER_MODULE_SETTINGS_TOKEN)
    private settings: UserSettingsInterface,
    @Optional()
    @Inject(EventListenService)
    private eventListenService?: EventListenService,
  ) {
    super();
  }

  onModuleInit() {
    if (this.eventListenService && this.settings.invitationRequestEvent) {
      this.eventListenService.on(this.settings.invitationRequestEvent, this);
    }
  }

  async listen(
    event: EventInstance<
      EventAsyncInterface<
        InvitationAcceptedRequestEventPayloadInterface,
        boolean
      >
    >,
  ): EventReturnType<
    EventAsyncInterface<InvitationAcceptedRequestEventPayloadInterface, boolean>
  > {
    if (!event) {
      throw new Error('No event data');
    }
    if (event?.payload?.category === 'invitation') {
      const { userId, newPassword } = event?.payload.data ?? {};
      if (!userId || !newPassword) {
        throw new Error('Invalid payload');
      }
      const user = await this.userLookupService.byId(userId as string);
      if (!user) {
        throw new Error('User not found');
      }
      await this.userMutateService.save({ ...user, password: newPassword });

      return true;
    } else {
      return true;
    }
  }
}

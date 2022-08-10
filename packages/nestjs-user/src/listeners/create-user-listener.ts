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

//TODO I think this is too complex to a junior or mid. Can we have something just like this? "extends <InvitationAcceptedRequestEventPayloadInterface, boolean>"
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
      //TODO sorry to insist but I think the majority of people will like more if this wold be just a callback instead of a class. I know that is hrad but I think we should give this option.
      this.eventListenService.on(this.settings.invitationRequestEvent, this);
    }
  }

  //TODO same complexity for the listener
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
    // check only for invitation of type category
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
      //TODO fix this later. It will work for one listener in the app but 2 or more the listeners that are not filtering by invitation category will send always false to the event sender.
      // For instance on a case that we have 3 listeners but only one is category the event emitter will receiver [true, false, false].
      return true;
    }
  }
}

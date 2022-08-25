import {
  EventAsyncInterface,
  EventListenerOn,
  EventListenService,
} from '@concepta/nestjs-event';
import { InvitationAcceptedEventPayloadInterface } from '@concepta/ts-common';
import { Inject, Injectable, OnModuleInit, Optional } from '@nestjs/common';

import { USER_MODULE_SETTINGS_TOKEN } from '../user.constants';
import { UserMutateService } from '../services/user-mutate.service';
import { UserSettingsInterface } from '../interfaces/user-settings.interface';
import { UserLookupService } from '../services/user-lookup.service';
import { UserNotFoundException } from '../exceptions/user-not-found-exception';
import { CreateUserEventInvalidPayloadException } from '../exceptions/create-user-event-invalid-payload-exception';

@Injectable()
export class CreateUserListener
  extends EventListenerOn<
    EventAsyncInterface<InvitationAcceptedEventPayloadInterface, boolean>
  >
  implements OnModuleInit
{
  constructor(
    @Inject(USER_MODULE_SETTINGS_TOKEN)
    private settings: UserSettingsInterface,
    private userLookupService: UserLookupService,
    private userMutateService: UserMutateService,
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
    event: EventAsyncInterface<
      InvitationAcceptedEventPayloadInterface,
      boolean
    >,
  ) {
    // check only for invitation of type category
    if (event.payload.category === 'invitation') {
      const { userId, newPassword } = event?.payload.data ?? {};

      if (!userId || !newPassword) {
        throw new CreateUserEventInvalidPayloadException();
      }

      const user = await this.userLookupService.byId(userId as string);

      if (!user) {
        throw new UserNotFoundException();
      }

      await this.userMutateService.save({ ...user, password: newPassword });

      return true;
    }

    // return true by default
    return true;
  }
}

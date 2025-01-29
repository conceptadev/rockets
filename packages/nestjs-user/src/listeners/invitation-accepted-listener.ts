import {
  EventAsyncInterface,
  EventListenerOn,
  EventListenService,
} from '@concepta/nestjs-event';
import {
  INVITATION_MODULE_CATEGORY_USER_KEY,
  InvitationAcceptedEventPayloadInterface,
} from '@concepta/nestjs-common';
import { Inject, Injectable, OnModuleInit, Optional } from '@nestjs/common';

import { USER_MODULE_SETTINGS_TOKEN } from '../user.constants';
import { UserMutateService } from '../services/user-mutate.service';
import { UserSettingsInterface } from '../interfaces/user-settings.interface';
import { UserLookupService } from '../services/user-lookup.service';
import { UserNotFoundException } from '../exceptions/user-not-found-exception';
import { UserException } from '../exceptions/user-exception';

@Injectable()
export class InvitationAcceptedListener
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
    if (
      event?.payload?.invitation?.category ===
      INVITATION_MODULE_CATEGORY_USER_KEY
    ) {
      const { userId, newPassword } = event?.payload?.data ?? {};

      if (typeof userId !== 'string' || typeof newPassword !== 'string') {
        throw new UserException({
          message:
            'The invitation accepted event payload received has invalid content. The payload must have the "userId" and "newPassword" properties.',
        });
      }

      const user = await this.userLookupService.byId(
        userId,
        event.payload?.queryOptions,
      );

      if (!user) {
        throw new UserNotFoundException();
      }

      // TODO: UPDATE PASSWORD how to get roles here?
      // should return on user lookup?
      await this.userMutateService.update(
        { ...user, password: newPassword },
        event.payload?.queryOptions,
      );

      return true;
    }

    // return true by default
    return true;
  }
}

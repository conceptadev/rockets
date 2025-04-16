import { EventAsyncInterface, EventListenerOn } from '@concepta/nestjs-event';
import {
  INVITATION_MODULE_CATEGORY_USER_KEY,
  InvitationAcceptedEventPayloadInterface,
} from '@concepta/nestjs-common';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

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
  ) {
    super();
  }

  onModuleInit() {
    if (this.settings.invitationAcceptedEvent) {
      this.on(this.settings.invitationAcceptedEvent);
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
      event.payload.invitation.category === INVITATION_MODULE_CATEGORY_USER_KEY
    ) {
      const userId = event.payload.invitation.userId;
      const { newPassword } = event.payload?.data ?? {};

      if (typeof userId !== 'string' || typeof newPassword !== 'string') {
        throw new UserException({
          message:
            'The invitation accepted event payload received has invalid content. The payload must have the "invitation.user" and "newPassword" properties.',
        });
      }

      const user = await this.userLookupService.byId(userId);

      if (!user) {
        throw new UserNotFoundException();
      }

      await this.userMutateService.update({ ...user, password: newPassword });

      return true;
    }

    // return true by default
    return true;
  }
}

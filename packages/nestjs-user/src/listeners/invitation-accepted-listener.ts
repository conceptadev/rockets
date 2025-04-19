import { EventAsyncInterface, EventListenerOn } from '@concepta/nestjs-event';
import {
  INVITATION_MODULE_CATEGORY_USER_KEY,
  InvitationAcceptedEventPayloadInterface,
} from '@concepta/nestjs-common';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { USER_MODULE_SETTINGS_TOKEN } from '../user.constants';
import { UserSettingsInterface } from '../interfaces/user-settings.interface';
import { UserNotFoundException } from '../exceptions/user-not-found-exception';
import { UserException } from '../exceptions/user-exception';

import { UserModelServiceInterface } from '../interfaces/user-model-service.interface';
import { UserModelService } from '../services/user-model.service';

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
    @Inject(UserModelService)
    private userModelService: UserModelServiceInterface,
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

      if (typeof userId !== 'string') {
        throw new UserException({
          message:
            'The invitation accepted event payload received has invalid content. The payload must have the "invitation.user" property.',
        });
      }

      const user = await this.userModelService.byId(userId);

      if (!user) {
        throw new UserNotFoundException();
      }

      await this.userModelService.update({ ...user });

      return true;
    }

    // return true by default
    return true;
  }
}

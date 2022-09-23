import {
  EventAsyncInterface,
  EventListenerOn,
  EventListenService,
} from '@concepta/nestjs-event';
import { Inject, Injectable, OnModuleInit, Optional } from '@nestjs/common';
import {
  EventInstance,
  EventReturnType,
} from '@concepta/nestjs-event/dist/event-types';
import {
  InvitationGetOrCreateUserEventPayloadInterface,
  InvitationGetOrCreateUserEventResponseInterface,
} from '@concepta/ts-common';
import { QueryOptionsInterface } from '@concepta/typeorm-common';

import { USER_MODULE_SETTINGS_TOKEN } from '../user.constants';
import { UserMutateService } from '../services/user-mutate.service';
import { UserSettingsInterface } from '../interfaces/user-settings.interface';
import { UserLookupService } from '../services/user-lookup.service';

@Injectable()
export class InvitationGetOrCreateUserListener
  extends EventListenerOn<
    EventAsyncInterface<
      InvitationGetOrCreateUserEventPayloadInterface,
      InvitationGetOrCreateUserEventResponseInterface
    >
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
    if (
      this.eventListenService &&
      this.settings.invitationGetOrCreateUserRequestEvent
    ) {
      this.eventListenService.on(
        this.settings.invitationGetOrCreateUserRequestEvent,
        this,
      );
    }
  }

  async listen(
    event: EventInstance<
      EventAsyncInterface<
        InvitationGetOrCreateUserEventPayloadInterface,
        InvitationGetOrCreateUserEventResponseInterface
      >
    >,
  ): EventReturnType<
    EventAsyncInterface<
      InvitationGetOrCreateUserEventPayloadInterface,
      InvitationGetOrCreateUserEventResponseInterface
    >
  > {
    const { email, queryOptions } = event.payload;

    return this.getOrCreateOneUser(email, queryOptions);
  }

  async getOrCreateOneUser(
    email: string,
    queryOptions?: QueryOptionsInterface,
  ): Promise<InvitationGetOrCreateUserEventResponseInterface> {
    let user = await this.userLookupService.byEmail(email, queryOptions);

    if (!user) {
      user = await this.userMutateService.create(
        {
          email,
          username: email,
        },
        queryOptions,
      );
    }

    return user;
  }
}

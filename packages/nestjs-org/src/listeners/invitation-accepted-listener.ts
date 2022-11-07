import {
  EventAsyncInterface,
  EventListenerOn,
  EventListenService,
} from '@concepta/nestjs-event';
import {
  INVITATION_MODULE_CATEGORY_ORG_KEY,
  InvitationAcceptedEventPayloadInterface,
} from '@concepta/ts-common';
import { Inject, Injectable, OnModuleInit, Optional } from '@nestjs/common';

import { ORG_MODULE_SETTINGS_TOKEN } from '../org.constants';
import { OrgSettingsInterface } from '../interfaces/org-settings.interface';
import { OrgMemberException } from '../exceptions/org-member.exception';
import { OrgMemberService } from '../services/org-member.service';

@Injectable()
export class InvitationAcceptedListener
  extends EventListenerOn<
    EventAsyncInterface<InvitationAcceptedEventPayloadInterface, boolean>
  >
  implements OnModuleInit
{
  constructor(
    @Inject(ORG_MODULE_SETTINGS_TOKEN)
    private settings: OrgSettingsInterface,
    private orgMemberService: OrgMemberService,
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
      INVITATION_MODULE_CATEGORY_ORG_KEY
    ) {
      const { userId } = event?.payload?.data ?? {};
      const { orgId } = event?.payload?.invitation?.constraints ?? {};

      if (typeof userId !== 'string') {
        throw new OrgMemberException(
          'The invitation accepted event payload received has invalid content. The payload must have the "userId" property.',
        );
      }

      if (typeof orgId !== 'string') {
        throw new OrgMemberException(
          'The org of invitation does not have orgId in constraints',
        );
      }

      await this.orgMemberService.add(
        { userId, orgId },
        event.payload?.queryOptions,
      );

      return true;
    }

    // return true by default
    return true;
  }
}

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
import { OrgMemberMutateService } from '../services/org-member-mutate.service';
import { OrgLookupService } from '../services/org-lookup.service';
import { OrgMemberException } from '../exceptions/org-member.exception';
import { OrgNotFoundException } from '../exceptions/org-not-found.exception';
import { UserLookupService } from '@concepta/nestjs-user';
import { UserNotFoundException } from '@concepta/nestjs-user/dist/exceptions/user-not-found-exception';
import { OrgMemberLookupService } from '../services/org-member-lookup.service';

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
    private orgLookupService: OrgLookupService,
    private userLookupService: UserLookupService,
    private orgMemberLookupService: OrgMemberLookupService,
    private orgMemberMutateService: OrgMemberMutateService,
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
    if (event.payload.category === INVITATION_MODULE_CATEGORY_ORG_KEY) {
      const { userId, orgId } = event?.payload.data ?? {};

      if (typeof userId !== 'string' || typeof orgId !== 'string') {
        throw new OrgMemberException(
          'The invitation accepted event payload received has invalid content. The payload must have the "userId" and "orgId" properties.',
        );
      }

      const org = await this.orgLookupService.byId(
        orgId,
        event.payload?.queryOptions,
      );

      if (!org) {
        throw new OrgNotFoundException();
      }

      const user = await this.userLookupService.byId(
        userId,
        event.payload?.queryOptions,
      );

      if (!user) {
        throw new UserNotFoundException();
      }

      const orgMember = await this.orgMemberLookupService.findOne(
        { where: { orgId, userId } },
        event.payload?.queryOptions,
      );

      if (orgMember) {
        throw new OrgMemberException(
          `Can't create OrgMember, the the combination of userid: ${userId} and orgId: ${orgId} already exists`,
        );
      }

      await this.orgMemberMutateService.create(
        { orgId, userId },
        event.payload?.queryOptions,
      );

      return true;
    }

    // return true by default
    return true;
  }
}

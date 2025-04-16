import { Injectable } from '@nestjs/common';
import { RepositoryInterface } from '@concepta/nestjs-common';
import { LookupService } from '@concepta/typeorm-common';
import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';

import { InvitationEntityInterface } from '../interfaces/domain/invitation-entity.interface';
import { InvitationLookupServiceInterface } from '../interfaces/services/invitation-lookup-service.interface';
import { INVITATION_MODULE_INVITATION_ENTITY_KEY } from '../invitation.constants';

/**
 * Invitation lookup service
 */
@Injectable()
export class InvitationLookupService
  extends LookupService<InvitationEntityInterface>
  implements InvitationLookupServiceInterface
{
  /**
   * Constructor
   *
   * @param repo - instance of the invitation repo
   */
  constructor(
    @InjectDynamicRepository(INVITATION_MODULE_INVITATION_ENTITY_KEY)
    repo: RepositoryInterface<InvitationEntityInterface>,
  ) {
    super(repo);
  }
}

import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';
import { MutateService, RepositoryInterface } from '@concepta/typeorm-common';
import { Injectable } from '@nestjs/common';

import { InvitationCreateDto } from '../dto/invitation-create.dto';
import { InvitationCreatableInterface } from '../interfaces/domain/invitation-creatable.interface';
import { InvitationMutateServiceInterface } from '../interfaces/services/invitation-mutate-service.interface';
import { InvitationEntityInterface } from '../interfaces/domain/invitation-entity.interface';
import { INVITATION_MODULE_INVITATION_ENTITY_KEY } from '../invitation.constants';

/**
 * Invitation mutate service
 */
@Injectable()
export class InvitationMutateService
  extends MutateService<
    InvitationEntityInterface,
    InvitationCreatableInterface,
    never
  >
  implements InvitationMutateServiceInterface
{
  protected createDto = InvitationCreateDto;
  protected updateDto!: never;

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

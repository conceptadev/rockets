import { Injectable } from '@nestjs/common';
import {
  ModelService,
  RepositoryInterface,
  InjectDynamicRepository,
} from '@concepta/nestjs-common';

import { InvitationEntityInterface } from '@concepta/nestjs-common';
import { InvitationModelServiceInterface } from '../interfaces/services/invitation-model-service.interface';
import { INVITATION_MODULE_INVITATION_ENTITY_KEY } from '../invitation.constants';
import { InvitationCreatableInterface } from '../interfaces/domain/invitation-creatable.interface';
import { InvitationCreateDto } from '../dto/invitation-create.dto';

/**
 * Invitation model service
 */
@Injectable()
export class InvitationModelService
  extends ModelService<
    InvitationEntityInterface,
    InvitationCreatableInterface,
    never
  >
  implements InvitationModelServiceInterface
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

  protected createDto = InvitationCreateDto;
  protected updateDto!: never;
}

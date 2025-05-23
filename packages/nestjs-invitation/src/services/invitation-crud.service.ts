import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectDynamicRepository } from '@concepta/nestjs-common';
import { TypeOrmCrudService } from '@concepta/nestjs-crud';

import { INVITATION_MODULE_INVITATION_ENTITY_KEY } from '../invitation.constants';
import { InvitationEntityInterface } from '../interfaces/domain/invitation-entity.interface';

@Injectable()
export class InvitationCrudService extends TypeOrmCrudService<InvitationEntityInterface> {
  constructor(
    @InjectDynamicRepository(INVITATION_MODULE_INVITATION_ENTITY_KEY)
    invitationRepo: Repository<InvitationEntityInterface>,
  ) {
    super(invitationRepo);
  }
}

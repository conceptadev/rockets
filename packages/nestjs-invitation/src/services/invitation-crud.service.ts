import { Repository } from 'typeorm';
import { TypeOrmCrudService } from '@concepta/nestjs-crud';
import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';
import { Injectable } from '@nestjs/common';

import { INVITATION_MODULE_INVITATION_ENTITY_KEY } from '../invitation.constants';
import { InvitationEntityInterface } from '../interfaces/invitation.entity.interface';

@Injectable()
export class InvitationCrudService extends TypeOrmCrudService<InvitationEntityInterface> {
  constructor(
    @InjectDynamicRepository(INVITATION_MODULE_INVITATION_ENTITY_KEY)
    invitationRepo: Repository<InvitationEntityInterface>,
  ) {
    super(invitationRepo);
  }
}

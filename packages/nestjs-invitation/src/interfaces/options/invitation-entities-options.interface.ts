import { TypeOrmExtEntityOptionInterface } from '@concepta/nestjs-typeorm-ext';
import { INVITATION_MODULE_INVITATION_ENTITY_KEY } from '../../invitation.constants';
import { InvitationEntityInterface } from '../domain/invitation-entity.interface';

export interface InvitationEntitiesOptionsInterface {
  entities: {
    [INVITATION_MODULE_INVITATION_ENTITY_KEY]: TypeOrmExtEntityOptionInterface<InvitationEntityInterface>;
  };
}

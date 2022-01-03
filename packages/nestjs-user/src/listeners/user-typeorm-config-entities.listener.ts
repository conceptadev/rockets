import { EventListenerOn } from '@rockts-org/nestjs-event';
import {
  TypeOrmConfigEntitiesEvent,
  TypeOrmConfigEntitiesValues,
} from '@rockts-org/nestjs-typeorm-config';
import { User } from '../entities/user.entity';

export class UserTypeOrmConfigEntitiesListener extends EventListenerOn<TypeOrmConfigEntitiesEvent> {
  async listen(event: TypeOrmConfigEntitiesEvent) {
    const r: TypeOrmConfigEntitiesValues = [[User]];
    return r;
  }
}

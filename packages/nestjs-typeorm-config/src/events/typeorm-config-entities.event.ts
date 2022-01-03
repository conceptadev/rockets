import { EventAsync } from '@rockts-org/nestjs-event';
import { TypeOrmConfigEntitiesValues } from '../typeorm-config.types';

export class TypeOrmConfigEntitiesEvent extends EventAsync<TypeOrmConfigEntitiesValues> {}

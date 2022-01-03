import { EventAsync } from '@rockts-org/nestjs-event';
import { TypeOrmConfigSubscribersValues } from '../typeorm-config.types';

export class TypeOrmConfigSubscribersEvent extends EventAsync<TypeOrmConfigSubscribersValues> {}

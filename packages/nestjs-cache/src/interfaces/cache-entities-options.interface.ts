import { TypeOrmExtEntityOptionInterface } from '@concepta/nestjs-typeorm-ext';

export interface CacheEntitiesOptionsInterface {
  entities: Record<string, TypeOrmExtEntityOptionInterface>;
}

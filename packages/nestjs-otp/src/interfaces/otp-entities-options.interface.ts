import { TypeOrmExtEntityOptionInterface } from '@concepta/nestjs-typeorm-ext';

export interface OtpEntitiesOptionsInterface {
  entities: Record<string, TypeOrmExtEntityOptionInterface>;
}

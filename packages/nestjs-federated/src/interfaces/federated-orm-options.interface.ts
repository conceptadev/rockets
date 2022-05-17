import { Repository } from 'typeorm';
import { Type } from '@nestjs/common';
import { TypeOrmExtOrmOptionsInterface } from '@concepta/nestjs-typeorm-ext';
import { FederatedEntityInterface } from './federated-entity.interface';

export interface FederatedOrmOptionsInterface
  extends TypeOrmExtOrmOptionsInterface {
  orm: {
    entities: {
      federated: { useClass: Type<FederatedEntityInterface> };
    };
    repositories: {
      federatedRepository: {
        useClass: Type<Repository<FederatedEntityInterface>>;
      };
    };
  };
}

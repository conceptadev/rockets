import { EntityRepository, Repository } from 'typeorm';
import { FederatedEntity } from './entities/federated.entity';
import { FederatedEntityInterface } from './interfaces/federated-entity.interface';

/**
 * Federated Repository
 */
// TODO: update deprecated Entity Repository
@EntityRepository(FederatedEntity)
export class FederatedRepository extends Repository<FederatedEntityInterface> {}

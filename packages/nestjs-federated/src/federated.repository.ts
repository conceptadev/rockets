import { EntityRepository, Repository } from 'typeorm';
import { Federated } from './entities/federated.entity';
import { FederatedEntityInterface } from './interfaces/federated-entity.interface';

/**
 * Federated Repository
 */
// TODO: update deprecated Entity Repository
@EntityRepository(Federated)
export class FederatedRepository extends Repository<FederatedEntityInterface> {}

import { EntityRepository, Repository } from 'typeorm';
import { FederatedEntityInterface } from '../interfaces/federated-entity.interface';
import { FederatedEntityFixture } from './federated-entity.fixture';

@EntityRepository(FederatedEntityFixture)
export class FederatedRepositoryFixture extends Repository<FederatedEntityInterface> {}

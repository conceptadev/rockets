import { EntityRepository, Repository } from 'typeorm';
import { FederatedEntityInterface } from '@concepta/nestjs-federated';
import { FederatedEntityFixture } from './federated-entity.fixture';

@EntityRepository(FederatedEntityFixture)
export class FederatedRepositoryFixture extends Repository<FederatedEntityInterface> {}

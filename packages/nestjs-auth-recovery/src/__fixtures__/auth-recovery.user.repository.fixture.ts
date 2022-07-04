import { EntityRepository, Repository } from 'typeorm';
import { UserEntityInterface } from '@concepta/nestjs-user';
import { AuthRecoveryUserEntityFixture } from './auth-recovery-user-entity.fixture';

@EntityRepository(AuthRecoveryUserEntityFixture)
export class AuthRecoveryUserRepositoryFixture extends Repository<UserEntityInterface> {}

import {
  EntityRepository,
  FindConditions,
  FindManyOptions,
  Repository,
} from 'typeorm';
import { UserEntity } from './user.entity';

@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {
  async find(options?: FindManyOptions<UserEntity>): Promise<UserEntity[]>;
  async find(conditions?: FindConditions<UserEntity>): Promise<UserEntity[]>;
  async find(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    optionsOrConditions?:
      | FindManyOptions<UserEntity>
      | FindConditions<UserEntity>,
  ): Promise<UserEntity[]> {
    return [new UserEntity()];
  }
}

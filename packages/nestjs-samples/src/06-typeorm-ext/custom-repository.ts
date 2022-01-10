import {
  EntityRepository,
  FindConditions,
  FindManyOptions,
  Repository,
} from 'typeorm';
import { CustomUser } from './custom-user.entity';

@EntityRepository(CustomUser)
export class CustomUserRepository extends Repository<CustomUser> {
  async find(options?: FindManyOptions<CustomUser>): Promise<CustomUser[]>;
  async find(conditions?: FindConditions<CustomUser>): Promise<CustomUser[]>;
  async find(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    optionsOrConditions?:
      | FindManyOptions<CustomUser>
      | FindConditions<CustomUser>,
  ): Promise<CustomUser[]> {
    return [new CustomUser()];
  }
}

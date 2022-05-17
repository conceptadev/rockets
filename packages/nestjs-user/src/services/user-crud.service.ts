import { Inject, Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@concepta/nestjs-crud';
import { USER_MODULE_USER_CUSTOM_REPO_TOKEN } from '../user.constants';
import { UserEntityInterface } from '../interfaces/user-entity.interface';
import { Repository } from 'typeorm';

/**
 * User CRUD service
 */
@Injectable()
export class UserCrudService extends TypeOrmCrudService<UserEntityInterface> {
  /**
   * Constructor
   *
   * @param userRepo instance of the user repository.
   */
  constructor(
    @Inject(USER_MODULE_USER_CUSTOM_REPO_TOKEN)
    private userRepo: Repository<UserEntityInterface>,
  ) {
    super(userRepo);
  }
}

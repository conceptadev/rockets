import { Inject, Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@rockts-org/nestjs-crud';
import { USER_MODULE_USER_CUSTOM_REPO_TOKEN } from '../user.constants';
import { UserRepository } from '../user.repository';
import { UserInterface } from '../interfaces/user.interface';

/**
 * User CRUD service
 */
@Injectable()
export class UserCrudService extends TypeOrmCrudService<UserInterface> {
  /**
   * Constructor
   *
   * @param userRepo instance of the user repository.
   */
  constructor(
    @Inject(USER_MODULE_USER_CUSTOM_REPO_TOKEN)
    private userRepo: UserRepository,
  ) {
    super(userRepo);
  }
}

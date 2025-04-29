import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@concepta/nestjs-crud';
import { InjectDynamicRepository } from '@concepta/nestjs-common';
import { USER_MODULE_USER_ENTITY_KEY } from '../user.constants';
import { UserEntityInterface } from '../interfaces/user-entity.interface';

/**
 * User CRUD service
 */
@Injectable()
export class UserCrudService extends TypeOrmCrudService<UserEntityInterface> {
  /**
   * Constructor
   *
   * @param userRepo - instance of the user repository.
   */
  constructor(
    // TODO: TYPEORM - tpeorm crud service uses a service ties to typeorm
    @InjectDynamicRepository(USER_MODULE_USER_ENTITY_KEY)
    protected readonly userRepo: Repository<UserEntityInterface>,
  ) {
    super(userRepo);
  }
}

import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { MutateService } from '@concepta/typeorm-common';
import {
  PasswordPlainInterface,
  UserCreatableInterface,
  UserUpdatableInterface,
} from '@concepta/ts-common';
import { PasswordStorageService } from '@concepta/nestjs-password';
import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';

import { USER_MODULE_USER_ENTITY_KEY } from '../user.constants';
import { UserEntityInterface } from '../interfaces/user-entity.interface';
import { UserMutateServiceInterface } from '../interfaces/user-mutate-service.interface';
import { UserCreateDto } from '../dto/user-create.dto';
import { UserUpdateDto } from '../dto/user-update.dto';

/**
 * User mutate service
 */
@Injectable()
export class UserMutateService
  extends MutateService<
    UserEntityInterface,
    UserCreatableInterface,
    UserUpdatableInterface
  >
  implements UserMutateServiceInterface
{
  protected createDto = UserCreateDto;
  protected updateDto = UserUpdateDto;

  /**
   * Constructor
   *
   * @param repo instance of the user repo
   * @param passwordStorageService
   */
  constructor(
    @InjectDynamicRepository(USER_MODULE_USER_ENTITY_KEY)
    protected repo: Repository<UserEntityInterface>,
    private passwordStorageService: PasswordStorageService,
  ) {
    super(repo);
  }

  protected async save<T extends UserEntityInterface>(
    user: T | (T & PasswordPlainInterface),
  ): Promise<UserEntityInterface> {
    // do we need to hash the password?
    if ('password' in user && typeof user.password === 'string') {
      // yes, hash it
      const hashedUser = await this.passwordStorageService.hashObject(user);
      // save it
      return super.save(hashedUser);
    } else {
      // save it
      return super.save(user);
    }
  }
}

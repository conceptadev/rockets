import { DeepPartial } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { MutateService, RepositoryInterface } from '@concepta/typeorm-common';
import {
  PasswordPlainInterface,
  UserCreatableInterface,
  UserUpdatableInterface,
} from '@concepta/nestjs-common';
import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';

import { UserPasswordService } from './user-password.service';
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
   * @param repo - instance of the user repo
   * @param userPasswordService - instance of a user password service
   */
  constructor(
    @InjectDynamicRepository(USER_MODULE_USER_ENTITY_KEY)
    repo: RepositoryInterface<UserEntityInterface>,
    protected readonly userPasswordService: UserPasswordService,
  ) {
    super(repo);
  }

  protected async transform<T extends DeepPartial<UserEntityInterface>>(
    user: T | (T & PasswordPlainInterface),
  ): Promise<DeepPartial<UserEntityInterface>> {
    // do we need to hash the password?
    if ('password' in user && typeof user.password === 'string') {
      // yes, hash it
      return this.userPasswordService.setPassword(user, user?.id);
    } else {
      // no changes
      return user;
    }
  }
}

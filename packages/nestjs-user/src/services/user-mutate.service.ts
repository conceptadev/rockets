import { DeepPartial, Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { ReferenceIdInterface } from '@concepta/nestjs-common';
import { MutateService } from '@concepta/nestjs-typeorm-ext';
import {
  PasswordNewInterface,
  PasswordStorageService,
} from '@concepta/nestjs-password';
import { UserEntityInterface } from '../interfaces/user-entity.interface';
import { UserMutateServiceInterface } from '../interfaces/user-mutate-service.interface';
import { UserCreatableInterface } from '../interfaces/user-creatable.interface';
import { UserUpdatableInterface } from '../interfaces/user-updatable.interface';
import { UserCreateDto } from '../dto/user-create.dto';
import { UserUpdateDto } from '../dto/user-update.dto';
import { USER_MODULE_USER_CUSTOM_REPO_TOKEN } from '../user.constants';

/**
 * User mutate service
 */
@Injectable()
export class UserMutateService
  extends MutateService<
    UserEntityInterface,
    UserCreatableInterface,
    ReferenceIdInterface & UserUpdatableInterface
  >
  implements UserMutateServiceInterface
{
  protected createDto = UserCreateDto;
  protected updateDto = UserUpdateDto;

  /**
   * Constructor
   *
   * @param repo instance of the user repo
   */
  constructor(
    @Inject(USER_MODULE_USER_CUSTOM_REPO_TOKEN)
    protected repo: Repository<UserEntityInterface>,
    private passwordStorageService: PasswordStorageService,
  ) {
    super(repo);
  }

  protected async save<T extends DeepPartial<UserEntityInterface>>(
    user: T | (T & PasswordNewInterface),
  ): Promise<UserEntityInterface> {
    // do we need to encrypt the password?
    if ('newPassword' in user && user.newPassword.length) {
      // yes, encrypt it
      user = await this.passwordStorageService.encryptObject(user);
    }
    // save it
    return super.save(user);
  }
}

import { Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { ReferenceIdInterface } from '@concepta/nestjs-common';
import { MutateService } from '@concepta/nestjs-typeorm-ext';
import { UserEntityInterface } from '../interfaces/user-entity.interface';
import { UserMutateServiceInterface } from '../interfaces/user-mutate-service.interface';
import { UserInterface } from '../interfaces/user.interface';
import { UserCreatableInterface } from '../interfaces/user-creatable.interface';
import { UserUpdatableInterface } from '../interfaces/user-updatable.interface';
import { UserDto } from '../dto/user.dto';
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
    UserInterface,
    ReferenceIdInterface & UserUpdatableInterface
  >
  implements UserMutateServiceInterface
{
  protected readDto = UserDto;
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
  ) {
    super(repo);
  }
}

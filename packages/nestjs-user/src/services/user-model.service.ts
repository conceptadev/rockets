import { Injectable } from '@nestjs/common';
import {
  UserCreatableInterface,
  UserUpdatableInterface,
  UserReplaceableInterface,
  RepositoryInterface,
  ModelService,
  ReferenceUsername,
  ReferenceSubject,
  ReferenceEmail,
  InjectDynamicRepository,
  UserEntityInterface,
} from '@concepta/nestjs-common';

import { UserModelServiceInterface } from '../interfaces/user-model-service.interface';
import { USER_MODULE_USER_ENTITY_KEY } from '../user.constants';
import { UserCreateDto } from '../dto/user-create.dto';
import { UserUpdateDto } from '../dto/user-update.dto';

/**
 * User model service
 */
@Injectable()
export class UserModelService
  extends ModelService<
    UserEntityInterface,
    UserCreatableInterface,
    UserUpdatableInterface,
    UserReplaceableInterface
  >
  implements UserModelServiceInterface
{
  protected createDto = UserCreateDto;
  protected updateDto = UserUpdateDto;

  /**
   * Constructor
   *
   * @param repo - instance of the user repo
   */
  constructor(
    @InjectDynamicRepository(USER_MODULE_USER_ENTITY_KEY)
    repo: RepositoryInterface<UserEntityInterface>,
  ) {
    super(repo);
  }

  /**
   * Get user for the given email.
   *
   * @param email - the email
   */
  async byEmail(email: ReferenceEmail): Promise<UserEntityInterface | null> {
    return this.repo.findOne({ where: { email } });
  }

  /**
   * Get user for the given subject.
   *
   * @param subject - the subject
   */
  async bySubject(
    subject: ReferenceSubject,
  ): Promise<UserEntityInterface | null> {
    return this.repo.findOne({ where: { id: subject } });
  }

  /**
   * Get user for the given username.
   *
   * @param username - the username
   */
  async byUsername(
    username: ReferenceUsername,
  ): Promise<UserEntityInterface | null> {
    return this.repo.findOne({ where: { username } });
  }
}

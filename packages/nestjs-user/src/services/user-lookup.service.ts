import { Injectable } from '@nestjs/common';
import {
  ReferenceEmail,
  ReferenceSubject,
  ReferenceUsername,
} from '@concepta/nestjs-common';
import {
  LookupService,
  QueryOptionsInterface,
  RepositoryInterface,
} from '@concepta/typeorm-common';
import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';

import { USER_MODULE_USER_ENTITY_KEY } from '../user.constants';
import { UserEntityInterface } from '../interfaces/user-entity.interface';
import { UserLookupServiceInterface } from '../interfaces/user-lookup-service.interface';

/**
 * User lookup service
 */
@Injectable()
export class UserLookupService
  extends LookupService<UserEntityInterface>
  implements UserLookupServiceInterface
{
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
  async byEmail(
    email: ReferenceEmail,
    queryOptions?: QueryOptionsInterface,
  ): Promise<UserEntityInterface | null> {
    return this.findOne({ where: { email } }, queryOptions);
  }

  /**
   * Get user for the given subject.
   *
   * @param subject - the subject
   */
  async bySubject(
    subject: ReferenceSubject,
    queryOptions?: QueryOptionsInterface,
  ): Promise<UserEntityInterface | null> {
    return this.findOne({ where: { id: subject } }, queryOptions);
  }

  /**
   * Get user for the given username.
   *
   * @param username - the username
   */
  async byUsername(
    username: ReferenceUsername,
    queryOptions?: QueryOptionsInterface,
  ): Promise<UserEntityInterface | null> {
    return this.findOne({ where: { username } }, queryOptions);
  }
}

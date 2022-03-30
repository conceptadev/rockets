import { Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { USER_MODULE_USER_CUSTOM_REPO_TOKEN } from '../user.constants';
import { UserEntityInterface } from '../interfaces/user-entity.interface';
import { UserLookupServiceInterface } from '../interfaces/user-lookup-service.interface';

/**
 * User lookup service
 */
@Injectable()
export class UserLookupService implements UserLookupServiceInterface {
  /**
   * Constructor
   *
   * @param userRepo instance of the user repo
   */
  constructor(
    @Inject(USER_MODULE_USER_CUSTOM_REPO_TOKEN)
    public userRepo: Repository<UserEntityInterface>,
  ) {}

  /**
   * Get user for the given id.
   *
   * @param id the id
   */
  async byId(id: string): Promise<UserEntityInterface> {
    return this.userRepo.findOne({ id });
  }

  /**
   * Get user for the given email.
   *
   * @param email the email
   */
  async byEmail(email: string): Promise<UserEntityInterface> {
    return this.userRepo.findOne({ email });
  }

  /**
   * Get user for the given subject.
   *
   * @param username the username
   */
  async bySubject(subject: string): Promise<UserEntityInterface> {
    return this.userRepo.findOne({ id: subject });
  }

  /**
   * Get user for the given username.
   *
   * @param username the username
   */
  async byUsername(username: string): Promise<UserEntityInterface> {
    return this.userRepo.findOne({ username });
  }
}

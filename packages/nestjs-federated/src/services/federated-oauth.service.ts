import { Inject, Injectable } from '@nestjs/common';
import {
  FEDERATED_MODULE_USER_LOOKUP_SERVICE_TOKEN,
  FEDERATED_MODULE_USER_MUTATE_SERVICE_TOKEN,
} from '../federated.constants';
import { FederatedEntityInterface } from '../interfaces/federated-entity.interface';

import { FederatedUserLookupServiceInterface } from '../interfaces/federated-user-lookup-service.interface';
import { FederatedUserMutateServiceInterface } from '../interfaces/federated-user-mutate-service.interface';
import { FederatedService } from './federated.service';
import { FederatedCredentialsInterface } from '../interfaces/federated-credentials.interface';
import { FederatedOAuthServiceInterface } from '../interfaces/federated-oauth-service.interface';

@Injectable()
export class FederatedOAuthService implements FederatedOAuthServiceInterface {
  constructor(
    @Inject(FEDERATED_MODULE_USER_LOOKUP_SERVICE_TOKEN)
    public userLookupService: FederatedUserLookupServiceInterface,
    @Inject(FEDERATED_MODULE_USER_MUTATE_SERVICE_TOKEN)
    public userMutateService: FederatedUserMutateServiceInterface,
    public federatedService: FederatedService,
  ) {}

  /**
   * Sign in with federated creating a user if it doesn't exist
   * @param provider - provider name (github, facebook, google)
   * @param subject - subject (user id/ profile id from provider)
   * @returns email - email of user
   *
   * @return FederatedCredentialsInterface - user information
   */
  async sign(
    provider: string,
    email: string,
    subject: string,
  ): Promise<FederatedCredentialsInterface> {
    const federated = await this.federatedService.exists(provider, subject);

    // if there is no federated user, create one
    if (!federated) {
      const newUser = await this.createUserWithFederated(
        provider,
        email,
        subject,
      );
      return newUser;
    } else {
      const user = await this.userLookupService.byId(federated.userId);

      // TODO: need to throw a custom exception
      if (!user) throw new Error('Failed to get user');

      return user;
    }
  }

  /**
   * Logic to create user and federated
   *
   * @private
   */
  protected async createUserWithFederated(
    provider: string,
    email: string,
    subject: string,
  ): Promise<FederatedCredentialsInterface> {
    // Check if user exists by email
    const user = await this.userLookupService.byEmail(email);
    let userResult: FederatedCredentialsInterface = null;

    // If user does not exists create a new one
    userResult = user ? user : await this.createUser(email, email);

    // Create federated
    await this.createFederated(provider, subject, userResult.id);

    return userResult;
  }

  /**
   * Create a user
   *
   * @private
   */
  protected async createUser(
    email: string,
    username: string,
  ): Promise<FederatedCredentialsInterface> {
    const newUser = await this.userMutateService.create({
      email,
      username,
    });

    // TODO: need to throw a custom exception
    if (!newUser) throw new Error('Failed to create user');

    return newUser;
  }

  /**
   * Create federated credentials
   *
   * @private
   */
  private async createFederated(
    provider: string,
    subject: string,
    userId: string,
  ): Promise<FederatedEntityInterface> {
    const federated = await this.federatedService.create({
      provider,
      subject,
      userId,
    });

    // TODO: need to throw a custom exception
    if (!federated) throw new Error('Failed to create federated');

    return federated;
  }
}

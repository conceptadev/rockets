import { Inject, Injectable } from '@nestjs/common';
import {
  NotAnErrorException,
  ReferenceIdInterface,
  ReferenceMutateException,
} from '@concepta/nestjs-common';
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
import { FederatedCreateException } from '../exceptions/federated-create.exception';
import { FederatedMutateCreateUserException } from '../exceptions/federated-mutate-create.exception';
import { FederatedUserLookupException } from '../exceptions/federated-user-lookup.exception';
import { FederatedMutateService } from './federated-mutate.service';
import { FederatedUserRelationshipException } from '../exceptions/federated-user-relationship.exception';

@Injectable()
export class FederatedOAuthService implements FederatedOAuthServiceInterface {
  constructor(
    @Inject(FEDERATED_MODULE_USER_LOOKUP_SERVICE_TOKEN)
    public userLookupService: FederatedUserLookupServiceInterface,
    @Inject(FEDERATED_MODULE_USER_MUTATE_SERVICE_TOKEN)
    public userMutateService: FederatedUserMutateServiceInterface,
    public federatedService: FederatedService,
    public federatedMutateService: FederatedMutateService,
  ) {}

  /**
   * Sign in with federated creating a user if it doesn't exist
   *
   * @param provider - provider name (github, facebook, google)
   * @param email - email account
   * @param subject - subject (user id/ profile id from provider)
   */
  async sign(
    provider: string,
    email: string,
    subject: string,
  ): Promise<FederatedCredentialsInterface> {
    const federated = await this.federatedService.exists(provider, subject);

    // if there is no federated user, create one
    if (!federated) {
      return await this.createUserWithFederated(provider, email, subject);
    } else {
      if (!federated.user?.id) {
        throw new FederatedUserRelationshipException(federated.id);
      }

      const user = await this.userLookupService.byId(federated.user.id);

      if (!user) {
        throw new FederatedUserLookupException(
          this.constructor.name,
          federated.user,
        );
      }

      return user;
    }
  }

  /**
   * Logic to create user and federated
   *
   * @internal
   */
  protected async createUserWithFederated(
    provider: string,
    email: string,
    subject: string,
  ): Promise<FederatedCredentialsInterface> {
    // Check if user exists by email
    const user = await this.userLookupService.byEmail(email);
    const userResult: FederatedCredentialsInterface = user
      ? user
      : await this.createUser(email, email);

    // Create federated
    await this.createFederated(provider, subject, userResult);

    return userResult;
  }

  /**
   * Create a user
   *
   * @internal
   */
  protected async createUser(
    email: string,
    username: string,
  ): Promise<FederatedCredentialsInterface> {
    try {
      const newUser = await this.userMutateService.create({
        email,
        username,
      });

      if (!newUser)
        throw new FederatedMutateCreateUserException(this.constructor.name, {
          message: 'Failed to create user',
        });

      return newUser;
    } catch (e) {
      const exception = e instanceof Error ? e : new NotAnErrorException(e);
      throw new FederatedMutateCreateUserException(
        this.constructor.name,
        exception,
      );
    }
  }

  /**
   * Create federated credentials
   *
   * @internal
   */
  private async createFederated(
    provider: string,
    subject: string,
    user: ReferenceIdInterface,
  ): Promise<FederatedEntityInterface> {
    try {
      const federated = await this.federatedMutateService.create({
        provider,
        subject,
        user,
      });

      if (!federated)
        throw new FederatedCreateException(this.constructor.name, {
          message: 'Failed to create federated',
        });

      return federated;
    } catch (e) {
      const exception = e instanceof Error ? e : new NotAnErrorException(e);
      throw new ReferenceMutateException(this.constructor.name, exception);
    }
  }
}

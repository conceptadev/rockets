import { Type } from '@nestjs/common';
import {
  CredentialLookupInterface,
  GetUserServiceInterface,
  IssueTokenServiceInterface,
} from '@rockts-org/nestjs-authentication';
import {
  OptionsAsyncInterface,
  OptionsInterface,
} from '@rockts-org/nestjs-common';

export interface AuthLocalOptionsInterface extends OptionsInterface {
  usernameField?: string;
  passwordField?: string;
  /**
   * Implementation of a class that returns CredentialLookupInterface
   */
  getUserService?: Type<GetUserServiceInterface<CredentialLookupInterface>>;
  /**
   * Implementation of a class to issue tokens
   */
  issueTokenService?: Type<IssueTokenServiceInterface>;
}

export interface AuthLocalAsyncOptionsInterface
  extends AuthLocalOptionsInterface,
    OptionsAsyncInterface<AuthLocalOptionsInterface> {}

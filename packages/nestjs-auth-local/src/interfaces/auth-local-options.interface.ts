import {
  CredentialLookupInterface,
  GetUserServiceInterface,
  IssueTokenServiceInterface,
} from '@rockts-org/nestjs-authentication';

import { OptionsInterface } from '@rockts-org/nestjs-common';
import { Type } from '@nestjs/common';

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

import { ModuleMetadata, Type } from '@nestjs/common';
import {
  CredentialLookupInterface,
  GetUserServiceInterface,
  IssueTokenServiceInterface,
} from '@rockts-org/nestjs-authentication';

/**
 * Local Authentication configuration options interface
 */
export interface LocalAuthOptionsInterface
  extends Pick<ModuleMetadata, 'imports'> {
  /**
   * Implementation of a class that returns CredentialLookupInterface
   */
  getUserService: Type<GetUserServiceInterface<CredentialLookupInterface>>;
  /**
   * Implementation of a class to issue tokens
   */
  issueTokenService: Type<IssueTokenServiceInterface>;
}

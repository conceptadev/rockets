import { ModuleMetadata, Type } from '@nestjs/common';
import {
  CredentialLookupInterface,
  GetUserServiceInterface,
  IssueTokenServiceInterface,
} from '@rockts-org/nestjs-authentication';
import {
  LocalStrategyConfigAsyncOptionsInterface,
  LocalStrategyConfigOptionsInterface,
} from './local-auth-config-options.interface';

export interface LocalStrategyServicesOptionsInterface {
  /**
   * Implementation of a class that returns CredentialLookupInterface
   */
  getUserService: Type<GetUserServiceInterface<CredentialLookupInterface>>;
  /**
   * Implementation of a class to issue tokens
   */
  issueTokenService: Type<IssueTokenServiceInterface>;
}

/**
 * Local Authentication configuration options interface
 */
export interface LocalStrategyOptionsInterface
  extends LocalStrategyServicesOptionsInterface,
    LocalStrategyConfigOptionsInterface,
    Pick<ModuleMetadata, 'imports'> {}

export interface LocalStrategyOptionsAsyncInterface
  extends LocalStrategyServicesOptionsInterface,
    LocalStrategyConfigAsyncOptionsInterface,
    Pick<ModuleMetadata, 'imports'> {}

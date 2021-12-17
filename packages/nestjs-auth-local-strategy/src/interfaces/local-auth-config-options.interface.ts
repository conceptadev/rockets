import { FactoryProvider, Type } from '@nestjs/common';
import {
  CredentialLookupInterface,
  GetUserServiceInterface,
  IssueTokenServiceInterface,
} from '@rockts-org/nestjs-authentication';

export interface LocalStrategyConfigOptionsInterface {
  usernameField?: string;
  passwordField?: string;
}

export interface LocalStrategyConfigAsyncOptionsInterface
  extends Pick<
    FactoryProvider<
      | LocalStrategyConfigOptionsInterface
      | Promise<LocalStrategyConfigOptionsInterface>
    >,
    'useFactory' | 'inject'
  > { }

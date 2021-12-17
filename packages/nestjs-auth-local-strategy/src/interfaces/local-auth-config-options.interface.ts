import { FactoryProvider } from '@nestjs/common';

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
  > {}

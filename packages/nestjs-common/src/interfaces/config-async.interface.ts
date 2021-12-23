import { ConfigInterface } from './config.interface';
import { FactoryProvider } from '@nestjs/common';
import { OptionsInterface } from './options.interface';

export interface ConfigAsyncInterface<T extends OptionsInterface>
  extends ConfigInterface<T>,
    Pick<FactoryProvider<T | Promise<T>>, 'useFactory' | 'inject'> {}

import { FactoryProvider } from '@nestjs/common';
import { OptionsInterface } from './options.interface';

export interface OptionsAsyncInterface<T extends OptionsInterface>
  extends OptionsInterface,
    Pick<FactoryProvider<T | Promise<T>>, 'useFactory' | 'inject'> {}

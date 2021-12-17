import { DynamicModule, FactoryProvider } from '@nestjs/common';
import { OptionsInterface } from './options.interface';

export interface RootAsyncDynamicModuleInterface extends DynamicModule {
  providers?: FactoryProvider<OptionsInterface | Promise<OptionsInterface>>[];
}

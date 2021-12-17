import { DynamicModule, FactoryProvider } from '@nestjs/common';
import { OptionsInterface } from './options.interface';

export interface RootAsyncModuleInterface extends DynamicModule {
  providers?: FactoryProvider<OptionsInterface | Promise<OptionsInterface>>[];
}

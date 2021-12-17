import { DynamicModule, ValueProvider } from '@nestjs/common';
import { OptionsInterface } from './options.interface';

export interface RootModuleInterface extends DynamicModule {
  providers?: ValueProvider<OptionsInterface | Promise<OptionsInterface>>[];
}

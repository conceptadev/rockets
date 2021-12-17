import { OptionsAsyncInterface } from './options-async.interface';
import { OptionsInterface } from './options.interface';
import { RootAsyncModuleInterface } from './root-async-module.interface';
import { RootModuleInterface } from './root-module.interface';

export interface ModuleFactoryInterface<T extends OptionsInterface> {
  forRoot(options: T): RootModuleInterface;
  forRootAsync(options: OptionsAsyncInterface<T>): RootAsyncModuleInterface;
}

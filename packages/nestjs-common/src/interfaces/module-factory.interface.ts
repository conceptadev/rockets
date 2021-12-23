import { ConfigAsyncInterface } from './config-async.interface';
import { ConfigInterface } from './config.interface';
import { OptionsInterface } from './options.interface';
import { RootAsyncModuleInterface } from './root-async-module.interface';
import { RootModuleInterface } from './root-module.interface';

export interface ModuleFactoryInterface<T extends OptionsInterface> {
  forRoot(config: ConfigInterface<T>): RootModuleInterface;
  forRootAsync(config: ConfigAsyncInterface<T>): RootAsyncModuleInterface;
}

export {
  AsyncModuleConfig,
  createConfigurableDynamicRootModule,
} from '@golevelup/nestjs-modules';

export { OptionsInterface } from './interfaces/options.interface';
export { ModuleOptionsControllerInterface } from './interfaces/module-options-controller.interface';
export { ModuleOptionsSettingsInterface } from './interfaces/module-options-settings.interface';
export { DeferExternalOptionsInterface } from './interfaces/defer-external-options.interface';

export { deferExternal } from './modules/defer-external';
export { negotiateController } from './modules/negotiate-controller';
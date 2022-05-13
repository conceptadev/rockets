export {
  AsyncModuleConfig,
  createConfigurableDynamicRootModule,
} from '@golevelup/nestjs-modules';

export { ModuleOptionsControllerInterface } from './modules/interfaces/module-options-controller.interface';
export { ModuleOptionsSettingsInterface } from './modules/interfaces/module-options-settings.interface';
export { DeferExternalOptionsInterface } from './modules/interfaces/defer-external-options.interface';

export { deferExternal } from './modules/defer-external';
export { negotiateController } from './modules/negotiate-controller';

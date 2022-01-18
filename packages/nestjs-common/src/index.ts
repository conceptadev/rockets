export {
  AsyncModuleConfig,
  createConfigurableDynamicRootModule,
} from '@golevelup/nestjs-modules';

export { OptionsInterface } from './interfaces/options.interface';
export { DeferExternalOptionsInterface } from './interfaces/defer-external-options.interface';
export { DecorateControllerOptionsInterface } from './interfaces/decorate-controller-options.interface';

export { deferExternal } from './modules/defer-external';
export { decorateController } from './controllers/decorate-controller.helper';

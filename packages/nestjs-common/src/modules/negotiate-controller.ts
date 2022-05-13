import { DynamicModule } from '@nestjs/common';
import { ModuleOptionsControllerInterface } from './interfaces/module-options-controller.interface';

/**
 * Negotiate the addition of controllers to a dynamic module.
 *
 * @param {DynamicModule} module A dynamic module
 * @param {ModuleOptionsControllerInterface} options Options containing controller setting.
 * @param {Type[]} defaultImports Array of modules to import if the controller is NOT overridden.
 * @returns {void}
 */
export function negotiateController(
  module: DynamicModule,
  options: ModuleOptionsControllerInterface,
) {
  if (options.controller === false) {
    module.controllers = [];
  } else if (options.controller) {
    module.controllers = Array.isArray(options.controller)
      ? options.controller
      : [options.controller];
  }
}

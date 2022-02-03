import { Controller, Post, Type } from '@nestjs/common';
import { decorateControllerOptions } from './decorate-controller-options.helper';
import { DecorateControllerOptionsInterface } from '../interfaces/decorate-controller-options.interface';

export function decorateController(
  controller: Type,
  options?: DecorateControllerOptionsInterface,
  defaultOptions?: DecorateControllerOptionsInterface,
) {
  const finalOptions = decorateControllerOptions(options, defaultOptions);

  Controller(finalOptions.route)(controller);

  for (const p in finalOptions.request) {
    const { route } = finalOptions.request[p];
    if (route) {
      const desc = Object.getOwnPropertyDescriptor(controller.prototype, p);
      Post(route)(controller, p, desc);
    }
  }
}

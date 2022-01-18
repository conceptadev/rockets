import { DecorateControllerOptionsInterface } from '../interfaces/decorate-controller-options.interface';

export function decorateControllerOptions(
  options: DecorateControllerOptionsInterface,
  defaultOptions: DecorateControllerOptionsInterface,
): DecorateControllerOptionsInterface {
  const mergedOptions = {
    route: { ...defaultOptions?.route, ...options?.route },
    request: {},
  };

  for (const p in defaultOptions.request) {
    const { route, dto } = defaultOptions.request[p];
    mergedOptions.request[p] = {
      route: options.request[p].route ?? route,
      dto: options.request[p].dto ?? dto,
    };
  }

  return mergedOptions;
}

import type { Type } from '@nestjs/common';
import type {
  RocketsAuthControllerExtrasBase,
  RocketsAuthRouteExtrasBase,
} from '../interfaces/controller/rockets-auth-controller-extras.interface';

/** Apply consumer class and route decorators to a generated controller. */
export function applyControllerExtras<
  ControllerClass extends Type<unknown>,
  RouteKey extends string,
>(
  controllerClass: ControllerClass,
  extras: RocketsAuthControllerExtrasBase<
    Partial<Record<RouteKey, RocketsAuthRouteExtrasBase>>
  >,
  routeMap: Record<
    RouteKey,
    Extract<keyof InstanceType<ControllerClass>, string>
  >,
): void {
  for (const decorator of extras.classDecorators ?? []) {
    decorator(controllerClass);
  }

  for (const routeKey in routeMap) {
    const methodName = routeMap[routeKey];
    const cfg = extras.routes?.[routeKey];
    if (!cfg?.decorators?.length) continue;

    const proto = controllerClass.prototype as Record<string, unknown>;
    const descriptor = Object.getOwnPropertyDescriptor(proto, methodName);
    if (!descriptor) continue;

    for (const decorator of cfg.decorators) {
      decorator(proto, methodName, descriptor);
    }
  }
}

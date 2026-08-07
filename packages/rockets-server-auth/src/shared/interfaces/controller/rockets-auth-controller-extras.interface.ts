/** Shared customization contract for generated HTTP controllers. */
export interface RocketsAuthRouteExtrasBase {
  /** Method decorators applied to the route handler. */
  decorators?: MethodDecorator[];
}

export interface RocketsAuthControllerExtrasBase<RouteMap = unknown> {
  /** Class-level decorators applied to the built controller class. */
  classDecorators?: ClassDecorator[];

  /**
   * Per-route extras keyed by route name. Concrete domain extras tighten
   * `RouteMap` to their own enum / string literal union.
   */
  routes?: RouteMap;
}

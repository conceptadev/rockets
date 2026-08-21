export type RocketsAuthClassDecorator = ClassDecorator;
export type RocketsAuthMethodDecorator = MethodDecorator;

export interface MePasswordRouteExtras {
  /** Method decorators applied to the route (Throttle, ApiResponse, etc.). */
  decorators?: RocketsAuthMethodDecorator[];
}

/**
 * Extra decorators for MePassword. `routes` keys must match handler names;
 * a new route cannot take extras until it has a key here.
 */
export interface MePasswordControllerExtras {
  /** Class-level decorators (UseGuards, ApiTags, custom metadata). */
  classDecorators?: RocketsAuthClassDecorator[];
  /** Per-route extras keyed by route name. */
  routes?: {
    changePassword?: MePasswordRouteExtras;
  };
}

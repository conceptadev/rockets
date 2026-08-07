import type { Type } from '@nestjs/common';
import type {
  RocketsAuthControllerExtrasBase,
  RocketsAuthRouteExtrasBase,
} from '../../../shared/interfaces/controller/rockets-auth-controller-extras.interface';

/**
 * Extras for the admin role CRUD resource. Class and route decorators are
 * forwarded to the generated controller; each route can replace its handler.
 */
export interface AdminRoleResourceRouteExtras
  extends RocketsAuthRouteExtrasBase {
  /** Replace the operation handler with a Nest provider class. */
  handler?: Type<unknown>;
}

export interface AdminRoleResourceRoutesMap {
  list?: AdminRoleResourceRouteExtras;
  read?: AdminRoleResourceRouteExtras;
  create?: AdminRoleResourceRouteExtras;
  update?: AdminRoleResourceRouteExtras;
  delete?: AdminRoleResourceRouteExtras;
}

export interface AdminRoleResourceExtras
  extends RocketsAuthControllerExtrasBase<AdminRoleResourceRoutesMap> {}

/**
 * Extras for the **admin/users/:userId/roles** hand-built controller. Routes
 * map to method names on the controller class.
 */
export interface AdminUserRolesRouteExtras extends RocketsAuthRouteExtrasBase {}

export interface AdminUserRolesRoutesMap {
  list?: AdminUserRolesRouteExtras;
  assign?: AdminUserRolesRouteExtras;
}

export interface AdminUserRolesControllerExtras
  extends RocketsAuthControllerExtrasBase<AdminUserRolesRoutesMap> {}

/** Aggregate of all role-related controller extras. */
export interface RoleControllerExtras {
  /** Extras for the admin/roles CRUD resource. */
  adminResource?: AdminRoleResourceExtras;
  /** Extras for the admin user-roles hand-built controller. */
  userRoles?: AdminUserRolesControllerExtras;
}

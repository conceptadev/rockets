import type { INestApplication } from '@nestjs/common';

import {
  parseStructuredRoutePattern,
  structuredRoutePatternsMayOverlap,
} from '../resource/planner/route-pattern';

export interface RegisteredRoute {
  readonly method: string;
  readonly path: string;
  readonly source?: string;
}

export interface RegisteredRouteCollision {
  readonly route: RegisteredRoute;
  readonly prior: RegisteredRoute;
}

interface ExpressLikeLayer {
  readonly route?: unknown;
}

export function collectRegisteredRoutes(
  app: Pick<INestApplication, 'getHttpAdapter'>,
): RegisteredRoute[] {
  const instance = app.getHttpAdapter().getInstance() as unknown;
  return collectExpressLikeRoutes(instance);
}

export function findRegisteredRouteCollisions(
  routes: readonly RegisteredRoute[],
): RegisteredRouteCollision[] {
  const collisions: RegisteredRouteCollision[] = [];
  const parsed = routes.map((route) => ({
    route,
    method: route.method.toUpperCase(),
    pattern: parseStructuredRoutePattern(route.path),
  }));

  for (const [index, current] of parsed.entries()) {
    for (const prior of parsed.slice(0, index)) {
      if (current.method !== prior.method) {
        continue;
      }
      if (
        structuredRoutePatternsMayOverlap(current.pattern, prior.pattern) !==
        true
      ) {
        continue;
      }
      collisions.push({ route: current.route, prior: prior.route });
    }
  }

  return collisions;
}

export function validateRegisteredRoutes(
  appOrRoutes:
    | Pick<INestApplication, 'getHttpAdapter'>
    | readonly RegisteredRoute[],
): void {
  const routes = isRegisteredRouteArray(appOrRoutes)
    ? appOrRoutes
    : collectRegisteredRoutes(appOrRoutes);
  const collisions = findRegisteredRouteCollisions(routes);
  if (collisions.length === 0) {
    return;
  }
  const collision = collisions[0];
  if (collision === undefined) {
    return;
  }
  throw new Error(
    `validateRegisteredRoutes: duplicate registered route ` +
      `${collision.route.method.toUpperCase()} "${collision.route.path}" ` +
      `claimed by ${formatRouteSource(collision.route)} and ` +
      `${formatRouteSource(collision.prior)}`,
  );
}

function isRegisteredRouteArray(
  value: Pick<INestApplication, 'getHttpAdapter'> | readonly RegisteredRoute[],
): value is readonly RegisteredRoute[] {
  return Array.isArray(value);
}

function collectExpressLikeRoutes(instance: unknown): RegisteredRoute[] {
  const router =
    readProperty(instance, 'router') ?? readProperty(instance, '_router');
  const stack = readProperty(router, 'stack');
  if (!Array.isArray(stack)) {
    throw new Error(
      'collectRegisteredRoutes: unsupported HTTP adapter route table; pass an explicit RegisteredRoute[] instead',
    );
  }

  const routes: RegisteredRoute[] = [];
  for (const layer of stack as readonly ExpressLikeLayer[]) {
    const route = asRecord(layer.route);
    if (route === undefined) {
      continue;
    }
    const paths = routePaths(route.path);
    const methods = routeMethods(route.methods);
    for (const path of paths) {
      for (const method of methods) {
        routes.push({
          method,
          path,
          source: `${method.toUpperCase()} ${path}`,
        });
      }
    }
  }
  return routes;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return (typeof value === 'object' || typeof value === 'function') &&
    value !== null
    ? (value as Record<string, unknown>)
    : undefined;
}

function readProperty(value: unknown, key: string): unknown {
  return asRecord(value)?.[key];
}

function routePaths(value: unknown): string[] {
  if (typeof value === 'string') {
    return [value];
  }
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }
  return [];
}

function routeMethods(value: unknown): string[] {
  const methods = asRecord(value);
  if (methods === undefined) {
    return [];
  }
  return Object.entries(methods)
    .filter(([, enabled]) => enabled === true)
    .map(([method]) => method.toUpperCase());
}

function formatRouteSource(route: RegisteredRoute): string {
  return route.source ?? `${route.method.toUpperCase()} ${route.path}`;
}

import { describe, expect, it } from 'vitest';

import {
  collectRegisteredRoutes,
  findRegisteredRouteCollisions,
  validateRegisteredRoutes,
} from './validate-registered-routes';

describe('validateRegisteredRoutes', () => {
  it('detects real registered path overlap', () => {
    const collisions = findRegisteredRouteCollisions([
      { method: 'GET', path: '/api/users/:id', source: 'UsersController.read' },
      { method: 'GET', path: '/api/users/me', source: 'UsersController.me' },
    ]);

    expect(collisions).toHaveLength(1);
    expect(collisions[0]?.route.source).toBe('UsersController.me');
  });

  it('does not report version-prefixed routes as collisions', () => {
    expect(
      findRegisteredRouteCollisions([
        { method: 'GET', path: '/api/v1/users/:id' },
        { method: 'GET', path: '/api/v2/users/:id' },
      ]),
    ).toHaveLength(0);
  });

  it('throws with the first collision', () => {
    expect(() =>
      validateRegisteredRoutes([
        { method: 'POST', path: '/ops/:id' },
        { method: 'POST', path: '/ops/run' },
      ]),
    ).toThrow(/duplicate registered route POST/);
  });

  it('fails explicitly when the adapter route table is unsupported', () => {
    const app = {
      getHttpAdapter: () => ({
        getInstance: () => ({}),
      }),
    };

    expect(() => collectRegisteredRoutes(app)).toThrow(
      /unsupported HTTP adapter route table/,
    );
  });
});

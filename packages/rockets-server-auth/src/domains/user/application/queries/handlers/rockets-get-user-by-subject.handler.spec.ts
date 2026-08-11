import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { QueryBus } from '@nestjs/cqrs';
import { GetAssignedRolesQuery } from '@concepta/nestjs-role';

import { RocketsGetUserBySubjectHandler } from './rockets-get-user-by-subject.handler';
import { RocketsGetUserBySubjectQuery } from '../impl/rockets-get-user-by-subject.query';

describe(RocketsGetUserBySubjectHandler.name, () => {
  let queryBus: { execute: Mock };
  let handler: RocketsGetUserBySubjectHandler;

  beforeEach(() => {
    queryBus = { execute: vi.fn() };
    handler = new RocketsGetUserBySubjectHandler(
      queryBus as unknown as QueryBus,
    );
  });

  it('returns null for an inactive user before resolving roles', async () => {
    queryBus.execute.mockResolvedValueOnce({
      toPlain: () => ({
        id: 'u1',
        email: 'person@example.com',
        username: 'person',
        active: false,
      }),
    });

    const result = await handler.execute(
      new RocketsGetUserBySubjectQuery({}, 'user-subject'),
    );

    expect(result).toBeNull();
    expect(queryBus.execute).toHaveBeenCalledOnce();
    expect(queryBus.execute).not.toHaveBeenCalledWith(
      expect.any(GetAssignedRolesQuery),
    );
  });
});

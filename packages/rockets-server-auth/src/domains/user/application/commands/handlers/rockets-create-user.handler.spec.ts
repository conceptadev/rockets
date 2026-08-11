import { vi, type Mock, describe, it, expect, beforeEach } from 'vitest';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '@concepta/nestjs-user';

import { RocketsCreateUserHandler } from './rockets-create-user.handler';
import { RocketsCreateUserCommand } from '../impl/rockets-create-user.command';

describe('RocketsCreateUserHandler', () => {
  const ctx = {};
  let handler: RocketsCreateUserHandler;
  let commandBus: { execute: Mock };

  beforeEach(() => {
    commandBus = { execute: vi.fn().mockResolvedValue(null) };
    handler = new RocketsCreateUserHandler(commandBus as unknown as CommandBus);
  });

  function dispatchedDto(): { active: unknown } {
    const command = commandBus.execute.mock.calls[0][0] as CreateUserCommand;
    return (command as unknown as { dto: { active: unknown } }).dto;
  }

  it('defaults active to true when omitted, so fail-closed auth does not lock the user out', async () => {
    await handler.execute(
      new RocketsCreateUserCommand(ctx, { email: 'a@b.com' }),
    );

    expect(commandBus.execute).toHaveBeenCalledWith(
      expect.any(CreateUserCommand),
    );
    expect(dispatchedDto().active).toBe(true);
  });

  it('preserves an explicit active: false so admins can create inactive users', async () => {
    await handler.execute(
      new RocketsCreateUserCommand(ctx, { email: 'a@b.com', active: false }),
    );

    expect(dispatchedDto().active).toBe(false);
  });
});

import { describe, expect, it, vi } from 'vitest';
import { UserPasswordHistoryViolationException } from '@concepta/nestjs-user';
import { AppContextHost } from '@concepta/nestjs-core';

import { RocketsAuthSetPasswordPortHandler } from './rockets-auth-password-port.handlers';
import { RocketsAuthSetPasswordPortCommand } from './rockets-auth-password-port.commands';

describe('RocketsAuthSetPasswordPortHandler', () => {
  it('rejects a reused password before creating or saving credentials', async () => {
    const repository = {
      findActiveByUserId: vi.fn().mockResolvedValue(null),
      findByUserId: vi.fn().mockResolvedValue([{}]),
      save: vi.fn(),
    };
    const passwordPort = {
      validateHistory: vi.fn().mockResolvedValue(false),
      create: vi.fn().mockResolvedValue({ passwordHash: 'hash' }),
    };
    const txCtx = {
      trx: { onCommit: vi.fn(), onRollback: vi.fn() },
    };
    const handler = new RocketsAuthSetPasswordPortHandler(
      repository as never,
      { password: { reuseAfterDays: 30 } } as never,
      passwordPort as never,
      { run: vi.fn((_ctx, work) => work(txCtx)) } as never,
      { mergeObjectContext: vi.fn() } as never,
    );

    await expect(
      handler.execute(
        new RocketsAuthSetPasswordPortCommand(
          new AppContextHost(),
          'ReusedP@ssword1',
          'u1',
        ),
      ),
    ).rejects.toBeInstanceOf(UserPasswordHistoryViolationException);
    expect(passwordPort.create).not.toHaveBeenCalled();
    expect(repository.save).not.toHaveBeenCalled();
  });
});

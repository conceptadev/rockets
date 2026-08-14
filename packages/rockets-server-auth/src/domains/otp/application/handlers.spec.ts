import { vi, type Mock, describe, it, expect, beforeEach } from 'vitest';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ValidateOtpQuery,
  ConsumeOtpCommand,
  CreateOtpCommand,
  ClearOtpsCommand,
} from '@concepta/nestjs-otp';

import { RocketsValidateOtpHandler } from './queries/handlers/rockets-validate-otp.handler';
import { RocketsValidateOtpQuery } from './queries/impl/rockets-validate-otp.query';
import { RocketsCreateOtpHandler } from './commands/handlers/rockets-create-otp.handler';
import { RocketsCreateOtpCommand } from './commands/impl/rockets-create-otp.command';
import { RocketsClearOtpsHandler } from './commands/handlers/rockets-clear-otps.handler';
import { RocketsClearOtpsCommand } from './commands/impl/rockets-clear-otps.command';

describe('OTP application handlers', () => {
  let queryBus: { execute: Mock };
  let commandBus: { execute: Mock };

  beforeEach(() => {
    queryBus = { execute: vi.fn() };
    commandBus = { execute: vi.fn() };
  });

  describe('RocketsValidateOtpHandler', () => {
    let handler: RocketsValidateOtpHandler;

    beforeEach(() => {
      handler = new RocketsValidateOtpHandler(
        queryBus as unknown as QueryBus,
        commandBus as unknown as CommandBus,
      );
    });

    it('returns null when consume returns null and skips validate', async () => {
      commandBus.execute.mockResolvedValueOnce(null);
      const out = await handler.execute(
        new RocketsValidateOtpQuery(
          {},
          'user-otp',
          { category: 'recovery', passcode: 'abc' },
          true,
        ),
      );
      expect(out).toBeNull();
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(ConsumeOtpCommand),
      );
      expect(queryBus.execute).not.toHaveBeenCalled();
    });

    it('consumes directly when deleteIfValid without a prior validate', async () => {
      const assignee = { assigneeId: 'u1' };
      commandBus.execute.mockResolvedValueOnce(assignee);
      const out = await handler.execute(
        new RocketsValidateOtpQuery(
          {},
          'user-otp',
          { category: 'recovery', passcode: 'abc' },
          true,
        ),
      );
      expect(out).toBe(assignee);
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(ConsumeOtpCommand),
      );
      expect(queryBus.execute).not.toHaveBeenCalled();
    });

    it('skips consume when deleteIfValid=false even on success', async () => {
      const assignee = { assigneeId: 'u1' };
      queryBus.execute.mockResolvedValueOnce(assignee);
      const out = await handler.execute(
        new RocketsValidateOtpQuery(
          {},
          'user-otp',
          { category: 'recovery', passcode: 'abc' },
          false,
        ),
      );
      expect(out).toBe(assignee);
      expect(queryBus.execute).toHaveBeenCalledWith(
        expect.any(ValidateOtpQuery),
      );
      expect(commandBus.execute).not.toHaveBeenCalled();
    });

    it('does not validate when deleteIfValid and skips set path on null consume', async () => {
      let remaining = 1;
      commandBus.execute.mockImplementation(async (cmd: unknown) => {
        expect(cmd).toBeInstanceOf(ConsumeOtpCommand);
        if (remaining === 0) return null;
        remaining -= 1;
        return { assigneeId: 'u1' };
      });

      const query = new RocketsValidateOtpQuery(
        {},
        'user-otp',
        { category: 'recovery', passcode: 'shared' },
        true,
      );
      const results = await Promise.all(
        Array.from({ length: 20 }, () => handler.execute(query)),
      );

      expect(results.filter((r) => r !== null)).toHaveLength(1);
      expect(results.filter((r) => r === null)).toHaveLength(19);
      expect(queryBus.execute).not.toHaveBeenCalled();
    });
  });

  describe('RocketsCreateOtpHandler', () => {
    it('dispatches CreateOtpCommand with assignment as namespace', async () => {
      const handler = new RocketsCreateOtpHandler(
        commandBus as unknown as CommandBus,
      );
      const created = { id: 'otp1' };
      commandBus.execute.mockResolvedValueOnce(created);

      const out = await handler.execute(
        new RocketsCreateOtpCommand(
          {},
          {
            assignment: 'user-otp',
            otp: {
              category: 'recovery',
              type: 'uuid',
              assigneeId: 'u1',
              expiresIn: '1h',
            },
          },
        ),
      );

      expect(out).toBe(created);
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(CreateOtpCommand),
      );
    });
  });

  describe('RocketsClearOtpsHandler', () => {
    it('dispatches ClearOtpsCommand with assignment as namespace', async () => {
      const handler = new RocketsClearOtpsHandler(
        commandBus as unknown as CommandBus,
      );
      commandBus.execute.mockResolvedValueOnce(undefined);

      await handler.execute(
        new RocketsClearOtpsCommand({}, 'user-otp', {
          category: 'recovery',
          assigneeId: 'u1',
        }),
      );

      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(ClearOtpsCommand),
      );
    });
  });
});

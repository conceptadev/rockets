import { describe, expect, it, vi } from 'vitest';

import { RocketsRecoveryService } from './rockets-recovery.service';

const ctx = { requestId: 'request-1' };
const policy = {
  otpCategory: 'recovery',
  otpNamespace: 'auth',
  otpType: 'uuid',
  otpExpiresIn: '1h',
  otpDuplicateStrategy: 'DEACTIVATE' as const,
  otpRateSeconds: 60,
  otpRateThreshold: 5,
};

function createSubject() {
  const rollbackActions: Array<() => void> = [];
  const transactionCtx = {
    requestId: 'transaction-request',
    onRollback(action: () => void): void {
      rollbackActions.push(action);
    },
  };
  const calls: string[] = [];
  const otpPort = {
    create: vi.fn(),
    validate: vi.fn(),
    consume: vi.fn(),
    clear: vi.fn(),
  };
  const userPort = { getByEmail: vi.fn(), getById: vi.fn() };
  const passwordPort = { setPassword: vi.fn() };
  const commandBus = { execute: vi.fn() };
  const notifications = {
    sendRecoverLoginNotificationCommand: class {},
    sendRecoverPasswordNotificationCommand: class {},
    sendPasswordUpdatedNotificationCommand: class {},
  };
  const txScope = {
    run: vi.fn(async (_ctx: unknown, operation: (ctx: unknown) => unknown) => {
      calls.push('transaction:start');
      try {
        const result = await operation(transactionCtx);
        calls.push('transaction:commit');
        return result;
      } catch (error) {
        calls.push('transaction:rollback');
        for (const action of rollbackActions.reverse()) action();
        throw error;
      }
    }),
  };
  const subject = new RocketsRecoveryService(
    policy,
    otpPort as never,
    userPort as never,
    passwordPort as never,
    notifications as never,
    commandBus as never,
    txScope as never,
  );
  return {
    subject,
    otpPort,
    userPort,
    passwordPort,
    commandBus,
    txScope,
    transactionCtx,
    calls,
  };
}

describe('RocketsRecoveryService', () => {
  it('awaits recovery notifications', async () => {
    const { subject, userPort, commandBus } = createSubject();
    userPort.getByEmail.mockResolvedValue({ id: 'u1', username: 'leo' });
    let release!: () => void;
    commandBus.execute.mockReturnValue(
      new Promise<void>((resolve) => (release = resolve)),
    );

    let settled = false;
    const pending = subject.recoverLogin(ctx, 'person@example.com').then(() => {
      settled = true;
    });
    await Promise.resolve();
    expect(settled).toBe(false);
    release();
    await pending;
    expect(commandBus.execute).toHaveBeenCalledOnce();
  });

  it('commits passcode consumption, password update, and revocation before notifying', async () => {
    const {
      subject,
      otpPort,
      userPort,
      passwordPort,
      commandBus,
      txScope,
      transactionCtx,
      calls,
    } = createSubject();
    otpPort.consume.mockImplementation(async () => {
      calls.push('consume');
      return { assigneeId: 'u1' };
    });
    userPort.getById.mockResolvedValue({
      id: 'u1',
      email: 'person@example.com',
    });
    passwordPort.setPassword.mockImplementation(async () => {
      calls.push('password');
    });
    otpPort.clear.mockImplementation(async () => {
      calls.push('clear');
    });
    commandBus.execute.mockImplementation(async () => {
      calls.push('notify');
    });

    await expect(
      subject.updatePassword(ctx, 'otp-secret', 'password-secret'),
    ).resolves.toMatchObject({ id: 'u1' });
    expect(txScope.run).toHaveBeenCalledOnce();
    expect(otpPort.consume).toHaveBeenCalledWith(transactionCtx, 'auth', {
      category: 'recovery',
      passcode: 'otp-secret',
    });
    expect(passwordPort.setPassword).toHaveBeenCalledWith(
      transactionCtx,
      'password-secret',
      'u1',
    );
    expect(otpPort.clear).toHaveBeenCalledWith(transactionCtx, 'auth', {
      category: 'recovery',
      assigneeId: 'u1',
    });
    expect(calls).toEqual([
      'transaction:start',
      'consume',
      'password',
      'clear',
      'transaction:commit',
      'notify',
    ]);
  });

  it('rolls back passcode consumption when the password update fails', async () => {
    const {
      subject,
      otpPort,
      userPort,
      passwordPort,
      commandBus,
      calls,
      transactionCtx,
    } = createSubject();
    let passcodeActive = true;
    otpPort.consume.mockImplementation(async (receivedCtx: unknown) => {
      expect(receivedCtx).toBe(transactionCtx);
      passcodeActive = false;
      transactionCtx.onRollback(() => {
        passcodeActive = true;
      });
      calls.push('consume');
      return { assigneeId: 'u1' };
    });
    userPort.getById.mockResolvedValue({
      id: 'u1',
      email: 'person@example.com',
    });
    passwordPort.setPassword.mockRejectedValue(new Error('write failed'));

    await expect(
      subject.updatePassword(ctx, 'otp-secret', 'password-secret'),
    ).rejects.toThrow('write failed');

    expect(passcodeActive).toBe(true);
    expect(otpPort.clear).not.toHaveBeenCalled();
    expect(commandBus.execute).not.toHaveBeenCalled();
  });

  it('does not roll back a committed password when notification fails', async () => {
    const { subject, otpPort, userPort, commandBus, calls } = createSubject();
    otpPort.consume.mockResolvedValue({ assigneeId: 'u1' });
    userPort.getById.mockResolvedValue({
      id: 'u1',
      email: 'person@example.com',
    });
    commandBus.execute.mockImplementation(async () => {
      calls.push('notify');
      throw new Error('mail provider included secret');
    });

    await expect(
      subject.updatePassword(ctx, 'otp-secret', 'password-secret'),
    ).resolves.toMatchObject({ id: 'u1' });
    expect(calls).toContain('transaction:commit');
    expect(calls.indexOf('transaction:commit')).toBeLessThan(
      calls.indexOf('notify'),
    );
    expect(calls).not.toContain('transaction:rollback');
  });
});

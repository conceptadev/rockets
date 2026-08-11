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
  const otpPort = {
    create: vi.fn(),
    validate: vi.fn(),
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
  const subject = new RocketsRecoveryService(
    policy,
    otpPort as never,
    userPort as never,
    passwordPort as never,
    notifications as never,
    commandBus as never,
  );
  return { subject, otpPort, userPort, passwordPort, commandBus };
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

  it('revokes recovery OTPs before best-effort password-updated notification', async () => {
    const { subject, otpPort, userPort, passwordPort, commandBus } =
      createSubject();
    otpPort.validate.mockResolvedValue({ assigneeId: 'u1' });
    userPort.getById.mockResolvedValue({
      id: 'u1',
      email: 'person@example.com',
    });
    commandBus.execute.mockRejectedValue(
      new Error('mail provider included secret'),
    );

    await expect(
      subject.updatePassword(ctx, 'otp-secret', 'password-secret'),
    ).resolves.toMatchObject({ id: 'u1' });
    expect(passwordPort.setPassword).toHaveBeenCalledWith(
      ctx,
      'password-secret',
      'u1',
    );
    expect(otpPort.clear).toHaveBeenCalledWith(ctx, 'auth', {
      category: 'recovery',
      assigneeId: 'u1',
    });
  });
});

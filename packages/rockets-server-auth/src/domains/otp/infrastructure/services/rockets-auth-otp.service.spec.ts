import { vi, type Mocked, describe, it, expect } from 'vitest';
import { Logger } from '@nestjs/common';
import { OtpInterface } from '@concepta/nestjs-otp';

import { RocketsAuthOtpService } from './rockets-auth-otp.service';
import { RocketsAuthOtpException } from '../../domain/exceptions/rockets-auth-otp.exception';
import { ROCKETS_AUTH_OTP_ASSIGNMENT } from '../../../../shared/constants/rockets-auth.constants';
import type { RocketsAuthOtpPortService } from '../../../../shared/ports/rockets-auth-otp-port.service';
import type { RocketsAuthUserPortService } from '../../../../shared/ports/rockets-auth-user-port.service';
import type { RocketsAuthSettingsInterface } from '../../../../shared/interfaces/rockets-auth-settings.interface';
import type { RocketsAuthOtpNotificationServiceInterface } from '../../interfaces/rockets-auth-otp-notification-service.interface';

const settings: RocketsAuthSettingsInterface = {
  role: { adminRoleName: 'admin' },
  email: {
    from: 't@t.com',
    baseUrl: 'http://localhost',
    templates: {
      sendOtp: { fileName: 'otp.hbs', subject: 'OTP' },
      invitation: { logo: '', fileName: 'inv.hbs', subject: 'Inv' },
      invitationAccepted: { logo: '', fileName: 'acc.hbs', subject: 'Acc' },
    },
  },
  otp: {
    assignment: ROCKETS_AUTH_OTP_ASSIGNMENT,
    category: 'auth-login',
    type: 'uuid',
    expiresIn: '1h',
  },
};

function makeService() {
  const userPort: Mocked<Pick<RocketsAuthUserPortService, 'byEmail'>> = {
    byEmail: vi.fn(),
  };
  const otpPort: Mocked<
    Pick<RocketsAuthOtpPortService, 'create' | 'validate' | 'clear'>
  > = {
    create: vi.fn(),
    validate: vi.fn(),
    clear: vi.fn(),
  };
  const notif: Mocked<RocketsAuthOtpNotificationServiceInterface> = {
    sendOtpEmail: vi.fn(),
  } as unknown as Mocked<RocketsAuthOtpNotificationServiceInterface>;

  const service = new RocketsAuthOtpService(
    settings,
    userPort as unknown as RocketsAuthUserPortService,
    otpPort as unknown as RocketsAuthOtpPortService,
    notif,
  );
  // suppress error logging in tests
  (service as unknown as { logger: Logger }).logger = {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    verbose: vi.fn(),
    fatal: vi.fn(),
    setLogLevels: vi.fn(),
    localInstance: {} as Logger,
  } as unknown as Logger;

  return { service, userPort, otpPort, notif };
}

describe(RocketsAuthOtpService.name, () => {
  const ctx = {};
  describe('sendOtp default flow', () => {
    it('resolves user, issues otp, delivers email', async () => {
      const { service, userPort, otpPort, notif } = makeService();
      userPort.byEmail.mockResolvedValueOnce({
        id: 'u1',
      } as Awaited<ReturnType<RocketsAuthUserPortService['byEmail']>>);
      otpPort.create.mockResolvedValueOnce({
        passcode: '123-abc',
      } as OtpInterface);

      await service.sendOtp(ctx, 'a@b.com');

      expect(userPort.byEmail).toHaveBeenCalledWith(ctx, 'a@b.com');
      expect(otpPort.create).toHaveBeenCalledWith(
        ctx,
        expect.objectContaining({
          assignment: ROCKETS_AUTH_OTP_ASSIGNMENT,
          otp: expect.objectContaining({ assigneeId: 'u1' }),
        }),
      );
      expect(notif.sendOtpEmail).toHaveBeenCalledWith({
        email: 'a@b.com',
        passcode: '123-abc',
      });
    });

    it('returns silently for unknown email (no leak)', async () => {
      const { service, userPort, otpPort, notif } = makeService();
      userPort.byEmail.mockResolvedValueOnce(null);

      await service.sendOtp(ctx, 'unknown@b.com');

      expect(otpPort.create).not.toHaveBeenCalled();
      expect(notif.sendOtpEmail).not.toHaveBeenCalled();
    });
  });

  describe('per-method override seams', () => {
    it('subclass can override `deliver` only (e.g. swap email for SMS)', async () => {
      const { userPort, otpPort, notif } = makeService();
      userPort.byEmail.mockResolvedValueOnce({
        id: 'u1',
      } as Awaited<ReturnType<RocketsAuthUserPortService['byEmail']>>);
      otpPort.create.mockResolvedValueOnce({
        passcode: 'sms-001',
      } as OtpInterface);

      const sms = vi.fn();
      class SmsOtp extends RocketsAuthOtpService {
        protected async deliver(
          email: string,
          otp: Pick<OtpInterface, 'passcode'>,
        ): Promise<void> {
          sms(email, otp.passcode);
        }
      }
      const sub = new SmsOtp(
        settings,
        userPort as unknown as RocketsAuthUserPortService,
        otpPort as unknown as RocketsAuthOtpPortService,
        notif,
      );

      await sub.sendOtp(ctx, 'a@b.com');

      expect(sms).toHaveBeenCalledWith('a@b.com', 'sms-001');
      expect(notif.sendOtpEmail).not.toHaveBeenCalled();
    });

    it('subclass can override `issueOtp` only (e.g. add cooldown)', async () => {
      const { userPort, otpPort, notif } = makeService();
      userPort.byEmail.mockResolvedValueOnce({
        id: 'u1',
      } as Awaited<ReturnType<RocketsAuthUserPortService['byEmail']>>);

      class WithCooldown extends RocketsAuthOtpService {
        protected async issueOtp(): Promise<OtpInterface> {
          throw new RocketsAuthOtpException();
        }
      }
      const sub = new WithCooldown(
        settings,
        userPort as unknown as RocketsAuthUserPortService,
        otpPort as unknown as RocketsAuthOtpPortService,
        notif,
      );

      await expect(sub.sendOtp(ctx, 'a@b.com')).rejects.toThrow(
        RocketsAuthOtpException,
      );
      expect(notif.sendOtpEmail).not.toHaveBeenCalled();
    });

    it('subclass can override `validatePasscode` to add lockout', async () => {
      const { userPort, otpPort, notif } = makeService();
      userPort.byEmail.mockResolvedValueOnce({
        id: 'u1',
      } as Awaited<ReturnType<RocketsAuthUserPortService['byEmail']>>);

      class StrictValidate extends RocketsAuthOtpService {
        protected async validatePasscode(): Promise<boolean> {
          return false;
        }
      }
      const sub = new StrictValidate(
        settings,
        userPort as unknown as RocketsAuthUserPortService,
        otpPort as unknown as RocketsAuthOtpPortService,
        notif,
      );

      await expect(sub.confirmOtp(ctx, 'a@b.com', 'whatever')).rejects.toThrow(
        RocketsAuthOtpException,
      );
    });
  });
});

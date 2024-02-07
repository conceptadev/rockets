import { PasswordPlainInterface } from '@concepta/ts-common';

import { PasswordStrengthEnum } from '../enum/password-strength.enum';
import { PasswordSettingsInterface } from '../interfaces/password-settings.interface';
import { PasswordStorageInterface } from '../interfaces/password-storage.interface';
import { PasswordCreationService } from './password-creation.service';
import { PasswordStorageService } from './password-storage.service';
import { PasswordStrengthService } from './password-strength.service';
import { PasswordValidationService } from './password-validation.service';

describe(PasswordCreationService, () => {
  let config: PasswordSettingsInterface;
  let passwordCreationService: PasswordCreationService;
  let passwordStorageService: PasswordStorageService;
  let passwordValidationService: PasswordValidationService;
  let passwordStrengthService: PasswordStrengthService;

  const PASSWORD_WEAK = 'secret';
  const PASSWORD_MEDIUM = 'F*h#1d*fQ@XB';

  beforeEach(async () => {
    config = {
      maxPasswordAttempts: 5,
      minPasswordStrength: PasswordStrengthEnum.Medium,
      requireCurrentToUpdate: false,
    };

    passwordStorageService = new PasswordStorageService();
    passwordValidationService = new PasswordValidationService();
    passwordStrengthService = new PasswordStrengthService(config);

    passwordCreationService = new PasswordCreationService(
      config,
      passwordStorageService,
      passwordValidationService,
      passwordStrengthService,
    );
  });

  it('should be defined', () => {
    expect(passwordCreationService).toBeDefined();
  });

  describe(PasswordCreationService.prototype.createObject, () => {
    it('should NOT create a password on object WITHOUT password being provided', async () => {
      type TestIn = Partial<PasswordPlainInterface> & { foo: string };
      type TestOut = Partial<PasswordStorageInterface> & { foo: string };

      // encrypt password
      const passwordStorageObject: TestOut =
        await passwordCreationService.createObject<TestIn>(
          { foo: 'bar' },
          { required: false },
        );

      expect(passwordStorageObject).toEqual({ foo: 'bar' });
    });

    it('should create a password on object WITHOUT current password requirement', async () => {
      // encrypt password
      const passwordStorageObject: PasswordStorageInterface =
        await passwordCreationService.createObject({
          password: PASSWORD_MEDIUM,
        });

      expect(typeof passwordStorageObject.passwordHash).toEqual('string');
      expect(typeof passwordStorageObject.passwordSalt).toEqual('string');
    });

    it('should NOT create a password on object WITH a WEAK password', async () => {
      const t = async () => {
        // try to create on object with a weak password
        await passwordCreationService.createObject({
          password: PASSWORD_WEAK,
        });
      };

      await expect(t).rejects.toThrow(Error);
      await expect(t).rejects.toThrow('Password is not strong enough');
    });
  });

  describe(PasswordCreationService.prototype.validateCurrent, () => {
    it('should be validated', async () => {
      // encrypt "current" password
      const passwordStorageObjectCurrent: PasswordStorageInterface =
        await passwordStorageService.hashObject({
          password: 'current-password-string',
        });

      const isValid = await passwordCreationService.validateCurrent({
        password: 'current-password-string',
        target: passwordStorageObjectCurrent,
      });

      expect(isValid).toEqual<boolean>(true);
    });

    it('should NOT be validated', async () => {
      // encrypt "current" password
      const passwordStorageObjectCurrent: PasswordStorageInterface =
        await passwordStorageService.hashObject({
          password: 'current-password-string',
        });

      const isValid = await passwordCreationService.validateCurrent({
        password: 'bad-current-password-string',
        target: passwordStorageObjectCurrent,
      });

      expect(isValid).toEqual<boolean>(false);
    });

    it('should NOT throw an error due to required current password setting', async () => {
      const isValid = await passwordCreationService.validateCurrent({});
      expect(isValid).toEqual<boolean>(true);
    });

    it('should throw an error due to required current password setting', async () => {
      passwordCreationService['settings'].requireCurrentToUpdate = true;

      const t = async () => {
        await passwordCreationService.validateCurrent({});
      };

      await expect(t).rejects.toThrow(Error);
      await expect(t).rejects.toThrow('Current password is required');
    });
  });

  it('PasswordCreationService.checkAttempt', () => {
    let canAttemptOneMore = passwordCreationService.checkAttempt(0);
    expect(canAttemptOneMore).toBe(true);

    canAttemptOneMore = passwordCreationService.checkAttempt();
    expect(canAttemptOneMore).toBe(true);

    canAttemptOneMore = passwordCreationService.checkAttempt(1);
    expect(canAttemptOneMore).toBe(true);

    canAttemptOneMore = passwordCreationService.checkAttempt(2);
    expect(canAttemptOneMore).toBe(true);

    canAttemptOneMore = passwordCreationService.checkAttempt(5);
    expect(canAttemptOneMore).toBe(true);

    canAttemptOneMore = passwordCreationService.checkAttempt(6);
    expect(canAttemptOneMore).toBe(false);
  });

  it('PasswordCreationService.checkAttempt', () => {
    let attemptsLeft = passwordCreationService.checkAttemptLeft(1);
    expect(attemptsLeft).toBe(4);

    attemptsLeft = passwordCreationService.checkAttemptLeft(0);
    expect(attemptsLeft).toBe(5);

    attemptsLeft = passwordCreationService.checkAttemptLeft();
    expect(attemptsLeft).toBe(5);

    attemptsLeft = passwordCreationService.checkAttemptLeft(2);
    expect(attemptsLeft).toBe(3);

    attemptsLeft = passwordCreationService.checkAttemptLeft(5);
    expect(attemptsLeft).toBe(0);

    attemptsLeft = passwordCreationService.checkAttemptLeft(6);
    expect(attemptsLeft).toBe(-1);
  });
});

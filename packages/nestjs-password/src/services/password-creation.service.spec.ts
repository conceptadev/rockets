import { PasswordStorageInterface } from '@concepta/nestjs-common';

import { PasswordStrengthEnum } from '../enum/password-strength.enum';
import { PasswordSettingsInterface } from '../interfaces/password-settings.interface';
import { PasswordCreationService } from './password-creation.service';
import { PasswordStorageService } from './password-storage.service';
import { PasswordStrengthService } from './password-strength.service';
import { PasswordValidationService } from './password-validation.service';
import { PasswordNotStrongException } from '../exceptions/password-not-strong.exception';

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

  describe(PasswordCreationService.prototype.create, () => {
    it('should create a password on object WITHOUT current password requirement', async () => {
      // encrypt password
      const passwordStorageObject: PasswordStorageInterface =
        await passwordCreationService.create(PASSWORD_MEDIUM);

      expect(typeof passwordStorageObject.passwordHash).toEqual('string');
      expect(typeof passwordStorageObject.passwordSalt).toEqual('string');
    });

    it('should NOT create a password on object WITH a WEAK password', async () => {
      const t = async () => {
        // try to create on object with a weak password
        await passwordCreationService.create(PASSWORD_WEAK);
      };

      await expect(t).rejects.toThrow(PasswordNotStrongException);
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
});

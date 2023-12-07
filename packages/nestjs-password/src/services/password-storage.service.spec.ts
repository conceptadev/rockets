import { fail } from 'assert';
import { PasswordStorageInterface } from '../interfaces/password-storage.interface';
import { PasswordStorageService } from './password-storage.service';
import { PasswordValidationService } from './password-validation.service';

describe(PasswordStorageService, () => {
  let storageService: PasswordStorageService;
  let validationService: PasswordValidationService;

  const PASSWORD_MEDIUM = 'AS12378';
  const PASSWORD_SALT = '$2b$10$aTP7AiVn2vWNiPg8/pQH3e';

  beforeEach(async () => {
    storageService = new PasswordStorageService();
    validationService = new PasswordValidationService();
  });

  it('should be defined', () => {
    expect(storageService).toBeDefined();
  });

  describe(PasswordStorageService.prototype.generateSalt, () => {
    it('salt should be a string', async () => {
      const salt = await storageService.generateSalt();

      expect(salt).not.toBeUndefined();
      expect(salt).not.toBeNull();
      expect(typeof salt).toEqual('string');
    });
  });

  describe(PasswordStorageService.prototype.hash, () => {
    it('should generate a password hash without providing a salt', async () => {
      // encrypt password
      const passwordStorageObject: PasswordStorageInterface =
        await storageService.hash(PASSWORD_MEDIUM);

      expect(typeof passwordStorageObject.passwordSalt).toEqual('string');

      // check if password encrypt can be decrypted
      const isValid = await validationService.validate({
        password: PASSWORD_MEDIUM,
        passwordHash: passwordStorageObject.passwordHash ?? '',
        passwordSalt: passwordStorageObject.passwordSalt ?? '',
      });

      expect(isValid).toEqual(true);
    });

    it('should generate a password hash from provided salt', async () => {
      // encrypt password
      const passwordStorageObject: PasswordStorageInterface =
        await storageService.hash(PASSWORD_MEDIUM, {
          salt: PASSWORD_SALT,
        });

      expect(passwordStorageObject.passwordSalt).toEqual(PASSWORD_SALT);

      // check if password encrypt can be decrypted
      const isValid = await validationService.validate({
        password: PASSWORD_MEDIUM,
        passwordHash: passwordStorageObject.passwordHash ?? '',
        passwordSalt: passwordStorageObject.passwordSalt ?? '',
      });

      expect(isValid).toEqual(true);
    });
  });

  describe(PasswordStorageService.prototype.hashObject, () => {
    it('should generate a password on object without providing a salt', async () => {
      // encrypt password
      const passwordStorageObject: PasswordStorageInterface =
        await storageService.hashObject(
          { password: PASSWORD_MEDIUM },
          {
            required: true,
          },
        );

      expect(typeof passwordStorageObject.passwordSalt).toEqual('string');

      // check if password encrypt can be decrypted
      const isValid = await validationService.validateObject(
        PASSWORD_MEDIUM,
        passwordStorageObject,
      );

      expect(isValid).toEqual(true);
    });

    it('should generate a password on object with provided salt', async () => {
      // encrypt password
      const passwordStorageObject: PasswordStorageInterface =
        await storageService.hashObject(
          {
            password: PASSWORD_MEDIUM,
          },
          {
            salt: PASSWORD_SALT,
          },
        );

      expect(passwordStorageObject.passwordSalt).toEqual(PASSWORD_SALT);

      // check if password encrypt can be decrypted
      const isValid = await validationService.validateObject(
        PASSWORD_MEDIUM,
        passwordStorageObject,
      );

      expect(isValid).toEqual(true);
    });

    it('should generate a password on object without providing a salt', async () => {
      // encrypt password
      const passwordStorageObject: Partial<PasswordStorageInterface> =
        await storageService.hashObject({ password: PASSWORD_MEDIUM });

      expect(typeof passwordStorageObject.passwordSalt).toEqual('string');

      if (
        typeof passwordStorageObject.passwordHash === 'string' &&
        typeof passwordStorageObject.passwordSalt === 'string'
      ) {
        // check if password encrypt can be decrypted
        const isValid = await validationService.validateObject(
          PASSWORD_MEDIUM,
          passwordStorageObject as PasswordStorageInterface,
        );

        expect(isValid).toEqual(true);
      } else {
        fail();
      }
    });

    it('should generate a password on object with provided salt', async () => {
      // encrypt password
      const passwordStorageObject: Partial<PasswordStorageInterface> =
        await storageService.hashObject(
          { password: PASSWORD_MEDIUM },
          {
            salt: PASSWORD_SALT,
          },
        );

      expect(passwordStorageObject.passwordSalt).toEqual(PASSWORD_SALT);

      if (
        typeof passwordStorageObject.passwordHash === 'string' &&
        typeof passwordStorageObject.passwordSalt === 'string'
      ) {
        // check if password encrypt can be decrypted
        const isValid = await validationService.validateObject(
          PASSWORD_MEDIUM,
          passwordStorageObject as PasswordStorageInterface,
        );

        expect(isValid).toEqual(true);
      } else {
        fail();
      }
    });

    it('should NOT generate a password on object (non provided)', async () => {
      // encrypt password
      const passwordStorageObject: Partial<PasswordStorageInterface> =
        await storageService.hashObject({}, { required: false });

      expect(typeof passwordStorageObject.passwordHash).toEqual('undefined');
      expect(typeof passwordStorageObject.passwordSalt).toEqual('undefined');
    });

    it('should FAIL to generate a password on object (non provided, but required)', async () => {
      const t = async () => {
        // encrypt password
        await storageService.hashObject({}, { required: true });
      };

      expect(t).rejects.toThrow(Error);
      expect(t).rejects.toThrow(
        'Password is required for hashing, but non was provided.',
      );
    });
  });
});

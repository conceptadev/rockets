import { PasswordStorageInterface } from '../interfaces/password-storage.interface';
import { PasswordStorageService } from './password-storage.service';
import { PasswordValidationService } from './password-validation.service';

describe('PasswordValidationService', () => {
  let storageService: PasswordStorageService;
  let validationService: PasswordValidationService;

  const PASSWORD_MEDIUM = 'AS12378';

  beforeEach(async () => {
    storageService = new PasswordStorageService();
    validationService = new PasswordValidationService();
  });

  it('should be defined', () => {
    expect(validationService).toBeDefined();
  });

  describe(PasswordValidationService.prototype.validate, () => {
    it('should successfully validate a good hash/salt combination', async () => {
      // Encrypt password
      const passwordStorageObject: PasswordStorageInterface =
        await storageService.hash(PASSWORD_MEDIUM);

      // check if password encrypt can be decrypted
      const isValid = await validationService.validate({
        passwordPlain: PASSWORD_MEDIUM,
        passwordHash: passwordStorageObject.passwordHash ?? '',
        passwordSalt: passwordStorageObject.passwordSalt ?? '',
      });

      expect(isValid).toEqual(true);
    });

    it('should NOT successfully validate a bad hash/salt combination', async () => {
      // fake salt
      const fakeSalt = await storageService.generateSalt();

      // check if password encrypt can be decrypted
      const isValid = await validationService.validate({
        passwordPlain: PASSWORD_MEDIUM,
        passwordHash: 'foo',
        passwordSalt: fakeSalt,
      });

      expect(isValid).toEqual(false);
    });
  });

  describe(PasswordValidationService.prototype.validateObject, () => {
    it('should successfully validate a good hash/salt combination on an object', async () => {
      // Encrypt password
      const passwordStorageObject: PasswordStorageInterface =
        await storageService.hash(PASSWORD_MEDIUM);

      // check if password encrypt can be decrypted
      const isValid = await validationService.validateObject({
        passwordPlain: PASSWORD_MEDIUM,
        object: passwordStorageObject,
      });

      expect(isValid).toEqual(true);
    });

    it('should NOT validate a bad hash/salt combination on an object', async () => {
      // fake salt
      const fakeSalt = await storageService.generateSalt();

      // check if password encrypt can be decrypted
      const isValid = await validationService.validateObject({
        passwordPlain: PASSWORD_MEDIUM,
        object: { passwordHash: 'foo', passwordSalt: fakeSalt },
      });

      expect(isValid).toEqual(false);
    });
  });
});

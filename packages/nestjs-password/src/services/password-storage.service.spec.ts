import { PasswordStorageInterface } from '../interfaces/password-storage.interface';
import { PasswordStorageService } from './password-storage.service';

describe('PasswordStorageService', () => {
  let service: PasswordStorageService;

  const PASSWORD_MEDIUM = 'AS12378';
  const PASSWORD_SALT = '$2b$10$aTP7AiVn2vWNiPg8/pQH3e';

  beforeEach(async () => {
    service = new PasswordStorageService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('PasswordStorageService.generateSalt', async () => {
    const salt = await service.generateSalt();

    expect(salt).toBeDefined();
  });

  it('PasswordStorageService.encrypt_salt', async () => {
    // Encrypt password
    const passwordStorageInterface: PasswordStorageInterface =
      await service.hash(PASSWORD_MEDIUM, PASSWORD_SALT);

    // check if password encrypt can be decrypted
    const isValid = await service.validate(
      PASSWORD_MEDIUM,
      passwordStorageInterface.passwordHash ?? '',
      passwordStorageInterface.passwordSalt ?? '',
    );

    expect(isValid).toBeTruthy();
  });

  it('PasswordStorageService.encrypt', async () => {
    // Encrypt password
    const passwordStorageInterface: PasswordStorageInterface =
      await service.hash(PASSWORD_MEDIUM);

    // check if password encrypt can be decrypted
    const isValid = await service.validate(
      PASSWORD_MEDIUM,
      passwordStorageInterface.passwordHash ?? '',
      passwordStorageInterface.passwordSalt ?? '',
    );

    expect(isValid).toBeTruthy();
  });
});

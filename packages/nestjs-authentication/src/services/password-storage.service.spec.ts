import { mock } from 'jest-mock-extended';

import { PasswordStorageInterface } from '../interface/dto/password-storage.interface';
import { PasswordStorageService } from './password-storage.service';
import { PasswordStrengthService } from './password-strength.service';

describe('PasswordStorageService', () => {
  let service: PasswordStorageService;
  let passwordStrengthService: PasswordStrengthService;
  
  const PASSWORD_MEDIUM: string = "AS12378";
  const PASSWORD_SALT: string = "$2b$10$aTP7AiVn2vWNiPg8/pQH3e";

  beforeEach(async () => {
    passwordStrengthService = mock<PasswordStrengthService>();
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
      await service.encrypt(PASSWORD_MEDIUM, PASSWORD_SALT);
    
    // check if password encrypt can be decrypted
    const isValid = await service.validatePassword(
      PASSWORD_MEDIUM,
      passwordStorageInterface.password,
      passwordStorageInterface.salt
    );
    
    expect(isValid).toBeTruthy();
  });

  it('PasswordStorageService.encrypt', async () => {
    
    // Encrypt password
    const passwordStorageInterface: PasswordStorageInterface =
      await service.encrypt(PASSWORD_MEDIUM);
    
    // check if password encrypt can be decrypted
    const isValid = await service.validatePassword(
      PASSWORD_MEDIUM,
      passwordStorageInterface.password,
      passwordStorageInterface.salt
    );
    
    expect(isValid).toBeTruthy();
  });
});

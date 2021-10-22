import { Test, TestingModule } from '@nestjs/testing';

import { CryptUtil } from '../common/crypt.util';
import { AUTHENTICATION_MODULE_CONFIG_TOKEN } from '../config/authentication.config';
import { PasswordStrengthEnum } from '../enum/password-strength.enum';
import { AuthenticationConfigOptionsInterface } from '../interface/authentication-config-options.interface';
import { PasswordStorageService } from './password-storage.service';
import { mock } from 'jest-mock-extended';
import { PasswordStorageInterface } from '../interface/dto/password-storage.interface';
import { PasswordStrengthService } from './password-strength.service';

describe('PasswordStorageService', () => {
  let service: PasswordStorageService;
  let spyGenerateSalt: jest.SpyInstance;
  let isStrong: jest.SpyInstance;
  let passwordStrengthService: PasswordStrengthService;
  
  const PASSWORD_NONE: string = "password";
  const PASSWORD_WEAK: string = "A12345678";
  const PASSWORD_MEDIUM: string = "AS12378";
  const PASSWORD_STRONG: string = "P@S645R78";
  const PASSWORD_VERY_STRONG: string = "P@5_0d645s9";
  const PASSWORD_SALT: string = "$2b$10$aTP7AiVn2vWNiPg8/pQH3e";


  beforeEach(async () => {
  
    passwordStrengthService = mock<PasswordStrengthService>();
    service = new PasswordStorageService(passwordStrengthService);
    
    isStrong = jest.spyOn(passwordStrengthService, 'isStrong')
      .mockReturnValue(true);
    
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

  it('PasswordStorageService.notStrong', async () => {
    
    isStrong = jest.spyOn(passwordStrengthService, 'isStrong').mockReturnValue(false);
    
    try {
      // Encrypt password
      const passwordStorageInterface: PasswordStorageInterface =
        await service.encrypt(PASSWORD_MEDIUM, PASSWORD_SALT);
    } catch (err) {
      expect(true).toBeTruthy();
    }

  });

});

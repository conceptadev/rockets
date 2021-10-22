import { mock } from 'jest-mock-extended';
import { PasswordCreationService, PasswordStrengthService } from '..';
import { PasswordStrengthEnum } from '../enum/password-strength.enum';
import { AuthenticationConfigOptionsInterface } from '../interface/authentication-config-options.interface';

describe('PasswordCreationService', () => {
  let service: PasswordCreationService;
  let passwordStrengthService: PasswordStrengthService;
  let spyIsStrong: jest.SpyInstance;
  
  const config = {
    maxPasswordAttempts: 5,
    minPasswordStrength: PasswordStrengthEnum.Strong
  } as AuthenticationConfigOptionsInterface;

  beforeEach(async () => {
    passwordStrengthService = mock<PasswordStrengthService>();
    spyIsStrong = jest.spyOn(passwordStrengthService, "isStrong");
    
    service = new PasswordCreationService(passwordStrengthService, config);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('PasswordCreationService.isStrong', () => {

    expect(service).toBeDefined();
  });
});

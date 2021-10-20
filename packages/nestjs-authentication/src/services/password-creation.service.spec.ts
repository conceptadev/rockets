import { Test, TestingModule } from '@nestjs/testing';
import { PasswordCreationService, PasswordStrengthService } from '..';
import { AUTHENTICATION_MODULE_CONFIG } from '../config/authentication.config';
import { PasswordStrengthEnum } from '../enum/password-strength.enum';
import { AuthenticationConfigOptionsInterface } from '../interface/authentication-config-options.interface';

describe('PasswordCreationService', () => {
  let service: PasswordCreationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AUTHENTICATION_MODULE_CONFIG,
          useValue: {
            maxPasswordAttempts: 5,
            minPasswordStrength: PasswordStrengthEnum.Strong
          } as AuthenticationConfigOptionsInterface
        },
        PasswordStrengthService,
        PasswordCreationService
      ],
    }).compile();

    service = module.get<PasswordCreationService>(PasswordCreationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

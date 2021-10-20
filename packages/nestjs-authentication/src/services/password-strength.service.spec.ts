import { Test, TestingModule } from '@nestjs/testing';
import { PasswordStrengthService } from '..';
import { AUTHENTICATION_MODULE_CONFIG } from '../config/authentication.config';
import { AuthenticationConfigOptionsInterface } from '../interface/authentication-config-options.interface';


describe('PasswordStrengthService', () => {
  let service: PasswordStrengthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{
        provide: AUTHENTICATION_MODULE_CONFIG,
        useValue: {
          maxPasswordAttempts: 3,
          minPasswordStrength: 8
        }
      },
      PasswordStrengthService],
    }).compile();

    service = module.get<PasswordStrengthService>(PasswordStrengthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

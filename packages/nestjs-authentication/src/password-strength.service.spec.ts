import { Test, TestingModule } from '@nestjs/testing';
import { PasswordStrengthService } from '.';

describe('PasswordStrengthService', () => {
  let service: PasswordStrengthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordStrengthService],
    }).compile();

    service = module.get<PasswordStrengthService>(PasswordStrengthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

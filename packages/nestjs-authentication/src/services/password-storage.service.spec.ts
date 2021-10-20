import { Test, TestingModule } from '@nestjs/testing';
import { PasswordStorageService } from './password-storage.service';

describe('PasswordStorageService', () => {
  let service: PasswordStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordStorageService],
    }).compile();

    service = module.get<PasswordStorageService>(PasswordStorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AccessControlDefaultService } from './access-control-default.service';

describe('AccessControlDefaultService', () => {
  let service: AccessControlDefaultService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccessControlDefaultService],
    }).compile();

    service = module.get<AccessControlDefaultService>(
      AccessControlDefaultService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

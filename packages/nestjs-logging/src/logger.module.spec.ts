import { Test } from '@nestjs/testing';
import { LoggerModule } from './logger.module';

describe('LoggerModule', () => {
  beforeEach(async () => {
    
  });

  describe('IsDefined', () => {
    it('was module defined', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [LoggerModule],
      }).compile();

      expect(moduleRef).toBeDefined();
    });
  });
});

import { Test } from '@nestjs/testing';
import { CrudTypeOrmService } from './crud-typeorm.service';

describe('TypeormService', () => {
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [CrudTypeOrmService],
    }).compile();
  });

  describe('getMany', () => {});
});

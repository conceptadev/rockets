import { Test } from '@nestjs/testing';
import { CrudQueryService } from './crud-query.service';

describe('TypeormService', () => {
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [CrudQueryService],
    }).compile();
  });
});

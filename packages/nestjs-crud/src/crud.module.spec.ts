import { Test, TestingModule } from '@nestjs/testing';
import { CrudModule } from './crud.module';

describe('CrudModule', () => {
  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('is controller defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CrudModule.register()],
    }).compile();

    expect(module).toBeDefined();
  });
});

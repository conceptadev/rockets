import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from './app.module';

describe('AppModule', () => {
  it('should be imported', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    expect(module).toBeInstanceOf(TestingModule);
  });
});

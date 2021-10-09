import { Test, TestingModule } from '@nestjs/testing';
import { SignController } from './sign.controller';

describe('SignController', () => {
  let controller: SignController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SignController],
    }).compile();

    controller = module.get<SignController>(SignController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

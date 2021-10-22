import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationModule } from './authentication.module';
import { SignController } from './sign.controller';

describe('AuthenticationModule', () => {
  let controller: SignController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports:[AuthenticationModule],
    }).compile();

    controller = module.get<SignController>(SignController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

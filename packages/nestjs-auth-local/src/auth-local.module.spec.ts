import { Test, TestingModule } from '@nestjs/testing';
import { EventModule } from '@rockts-org/nestjs-event';

import { AuthLocalController } from '.';
import { AuthLocalModule } from './auth-local.module';

describe('AuthLocalModuleTest', () => {
  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('is controller defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthLocalModule.register(), EventModule.register()],
    }).compile();

    const controller = module.get<AuthLocalController>(AuthLocalController);

    expect(controller).toBeDefined();
  });
});

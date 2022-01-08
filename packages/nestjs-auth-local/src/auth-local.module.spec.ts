import { Test, TestingModule } from '@nestjs/testing';
import { EventModule } from '@rockts-org/nestjs-event';
import { User } from '@rockts-org/nestjs-user';
import { mock } from 'jest-mock-extended';
import { AuthLocalController } from '.';
import { AuthLocalModule } from './auth-local.module';

describe('AuthLocalModuleTest', () => {
  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('is controller defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthLocalModule.register(), EventModule.register()],
    })
      .overrideProvider('USER_MODULE_ORM_ENTITY_TOKEN')
      .useValue(mock<User>())
      .overrideProvider('USER_MODULE_ORM_REPO_TOKEN')
      .useValue({})
      .compile();

    const controller = module.get<AuthLocalController>(AuthLocalController);

    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationModule } from '@concepta/nestjs-authentication';
import { CrudModule } from '@concepta/nestjs-crud';
import { JwtModule } from '@concepta/nestjs-jwt';
import { PasswordModule } from '@concepta/nestjs-password';
import { User, UserCrudService, UserModule } from '@concepta/nestjs-user';
import { mock } from 'jest-mock-extended';
import { AuthLocalController } from './auth-local.controller';
import { AuthLocalModule } from './auth-local.module';

describe('AuthLocalModuleTest', () => {
  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('is controller defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AuthLocalModule.register(),
        AuthenticationModule.register(),
        JwtModule.register(),
        PasswordModule.register(),
        CrudModule.register(),
        UserModule.register(),
      ],
    })
      .overrideProvider('USER_MODULE_USER_ENTITY_REPO_TOKEN')
      .useValue(mock<User>())
      .overrideProvider('USER_MODULE_USER_CUSTOM_REPO_TOKEN')
      .useValue({})
      .overrideProvider(UserCrudService)
      .useValue({})
      .compile();

    const controller = module.get(AuthLocalController);
    expect(controller).toBeDefined();
  });
});

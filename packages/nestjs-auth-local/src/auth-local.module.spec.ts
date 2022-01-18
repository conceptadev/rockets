import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationModule } from '@rockts-org/nestjs-authentication';
import { JwtModule } from '@rockts-org/nestjs-jwt';
import { PasswordModule } from '@rockts-org/nestjs-password';
import { User, UserModule } from '@rockts-org/nestjs-user';
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
        UserModule.register(),
      ],
    })
      .overrideProvider('USER_MODULE_USER_ENTITY_REPO_TOKEN')
      .useValue(mock<User>())
      .overrideProvider('USER_MODULE_USER_CUSTOM_REPO_TOKEN')
      .useValue({})
      .compile();

    const controller = module.get(AuthLocalController);
    expect(controller).toBeDefined();
  });
});

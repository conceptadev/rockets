import { mock } from 'jest-mock-extended';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationModule } from '@concepta/nestjs-authentication';
import { JwtModule } from '@concepta/nestjs-jwt';
import { PasswordModule } from '@concepta/nestjs-password';
import { AuthLocalController } from './auth-local.controller';
import { AuthLocalModule } from './auth-local.module';
import { AuthLocalCredentialsInterface } from './interfaces/auth-local-credentials.interface';
import { UserLookupServiceFixture } from './__fixtures__/user/user-lookup.service.fixture';

describe('AuthLocalModuleTest', () => {
  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('is controller defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserLookupServiceFixture],
      imports: [
        AuthLocalModule.register({
          userLookupService: new UserLookupServiceFixture(),
        }),
        AuthenticationModule.register(),
        JwtModule.register(),
        PasswordModule.register(),
      ],
    })
      .overrideProvider('USER_MODULE_USER_ENTITY_REPO_TOKEN')
      .useValue(mock<AuthLocalCredentialsInterface>())
      .overrideProvider('USER_MODULE_USER_CUSTOM_REPO_TOKEN')
      .useValue({})
      .compile();

    const controller = module.get(AuthLocalController);
    expect(controller).toBeDefined();
  });
});

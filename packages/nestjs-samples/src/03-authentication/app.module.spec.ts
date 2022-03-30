import { Test, TestingModule } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { AppModule } from './app.module';
import { IssueTokenService } from '@concepta/nestjs-authentication';
import {
  AuthLocalController,
  AuthLocalUserLookupServiceInterface,
} from '@concepta/nestjs-auth-local';
import { User, UserCrudService, UserService } from '@concepta/nestjs-user';
import { TestUserRepository } from './user/user.repository';

describe('AppModule', () => {
  it('should be imported', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('USER_MODULE_USER_ENTITY_REPO_TOKEN')
      .useValue(mock<User>())
      .overrideProvider('USER_MODULE_USER_CUSTOM_REPO_TOKEN')
      .useValue(new TestUserRepository())
      .overrideProvider(UserCrudService)
      .useValue({})
      .compile();

    const userService = module.get<UserService>(UserService);
    const issueTokenService = module.get<IssueTokenService>(IssueTokenService);
    const userLookupService = module.get<AuthLocalUserLookupServiceInterface>(
      'AUTH_LOCAL_MODULE_USER_LOOKUP_SERVICE_TOKEN',
    );
    const authLocalcontroller = module.get(AuthLocalController);

    expect(module).toBeInstanceOf(TestingModule);
    expect(userService).toBeInstanceOf(UserService);
    expect(issueTokenService).toBeInstanceOf(IssueTokenService);
    expect(userLookupService).toBeInstanceOf(Object);
    expect(authLocalcontroller).toBeInstanceOf(AuthLocalController);
    expect(authLocalcontroller['issueTokenService']).toBeInstanceOf(
      IssueTokenService,
    );
  });
});

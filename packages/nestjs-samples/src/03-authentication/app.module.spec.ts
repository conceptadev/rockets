import { Test, TestingModule } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { AppModule } from './app.module';
import { IssueTokenService } from '@rockts-org/nestjs-authentication';
import {
  UserLookupService,
  AuthLocalController,
} from '@rockts-org/nestjs-auth-local';
import { User, UserService } from '@rockts-org/nestjs-user';
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
      .compile();

    const userService = module.get<UserService>(UserService);
    const issueTokenService = module.get<IssueTokenService>(IssueTokenService);
    const userLookupService = module.get<UserLookupService>(UserLookupService);
    const authLocalcontroller =
      module.get<AuthLocalController>(AuthLocalController);

    expect(module).toBeInstanceOf(TestingModule);
    expect(userService).toBeInstanceOf(UserService);
    expect(issueTokenService).toBeInstanceOf(IssueTokenService);
    expect(userLookupService).toBeInstanceOf(UserLookupService);
    expect(authLocalcontroller).toBeInstanceOf(AuthLocalController);
    expect(authLocalcontroller['issueTokenService']).toBeInstanceOf(
      IssueTokenService,
    );
  });
});

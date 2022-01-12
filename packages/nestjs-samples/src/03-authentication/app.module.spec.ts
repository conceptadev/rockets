import { Test, TestingModule } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { AppModule } from './app.module';
import { AuthLocalController } from '@rockts-org/nestjs-auth-local';
import { User, UserService } from '@rockts-org/nestjs-user';
import { UserLookupService } from '@rockts-org/nestjs-auth-local';
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
    const userLookupService = module.get<UserLookupService>(UserLookupService);

    const controller = module.get<AuthLocalController>(AuthLocalController);

    expect(module).toBeInstanceOf(TestingModule);
    expect(userService).toBeInstanceOf(UserService);
    expect(userLookupService).toBeInstanceOf(UserLookupService);
    expect(controller).toBeInstanceOf(AuthLocalController);
  });
});

import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { RepositoryInterface } from '@concepta/nestjs-common';
import { UserModule, UserLookupService } from '@concepta/nestjs-user';
import { getDynamicRepositoryToken } from '@concepta/nestjs-typeorm-ext';
import { UserController } from '@concepta/nestjs-user';
import { AppModule } from './app.module';
import { UserEntity } from './user/user.entity';

describe('AppModule', () => {
  let userModule: UserModule;
  let userLookupService: UserLookupService;
  let userController: UserController;
  let userRepo: RepositoryInterface<UserEntity>;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    userModule = testModule.get<UserModule>(UserModule);
    userRepo = testModule.get(getDynamicRepositoryToken('user'));
    userLookupService = testModule.get<UserLookupService>(UserLookupService);
    userController = testModule.get<UserController>(UserController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('module', () => {
    it('should be loaded', async () => {
      expect(userModule).toBeInstanceOf(UserModule);
      expect(userRepo).toBeInstanceOf(Repository);
      expect(userLookupService).toBeInstanceOf(UserLookupService);
      expect(userLookupService['repo']).toBeInstanceOf(Repository);
      expect(userLookupService['repo'].find).toBeInstanceOf(Function);
      expect(userController).toBeInstanceOf(UserController);
    });
  });
});

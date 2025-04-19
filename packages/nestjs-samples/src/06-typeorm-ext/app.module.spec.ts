import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { UserModule, UserModelService } from '@concepta/nestjs-user';
import { RepositoryInterface } from '@concepta/nestjs-common';
import { getDynamicRepositoryToken } from '@concepta/nestjs-typeorm-ext';
import { UserController } from '@concepta/nestjs-user';
import { AppModule } from './app.module';
import { UserEntity } from './user/user.entity';

describe('AppModule', () => {
  let userModule: UserModule;
  let userModelService: UserModelService;
  let userController: UserController;
  let userRepo: RepositoryInterface<UserEntity>;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    userModule = testModule.get<UserModule>(UserModule);
    userRepo = testModule.get(getDynamicRepositoryToken('user'));
    userModelService = testModule.get<UserModelService>(UserModelService);
    userController = testModule.get<UserController>(UserController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('module', () => {
    it('should be loaded', async () => {
      expect(userModule).toBeInstanceOf(UserModule);
      expect(userRepo).toBeInstanceOf(Repository);
      expect(userModelService).toBeInstanceOf(UserModelService);
      expect(userModelService['repo']).toBeInstanceOf(Repository);
      expect(userModelService['repo'].find).toBeInstanceOf(Function);
      expect(userController).toBeInstanceOf(UserController);
    });
  });
});

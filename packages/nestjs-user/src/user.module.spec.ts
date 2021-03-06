import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { getDynamicRepositoryToken } from '@concepta/nestjs-typeorm-ext';
import { UserModule } from './user.module';
import { UserCrudService } from './services/user-crud.service';
import { UserController } from './user.controller';
import { DefaultUserLookupService } from './services/default-user-lookup.service';
import { DefaultUserMutateService } from './services/default-user-mutate.service';
import { UserLookupService } from './services/user-lookup.service';
import { UserMutateService } from './services/user-mutate.service';
import { USER_MODULE_USER_ENTITY_KEY } from './user.constants';

import { AppModuleFixture } from './__fixtures__/app.module.fixture';
import { UserEntityFixture } from './__fixtures__/user.entity.fixture';

describe('AppModule', () => {
  let userModule: UserModule;
  let userLookupService: DefaultUserLookupService;
  let userMutateService: DefaultUserMutateService;
  let userCrudService: UserCrudService;
  let userController: UserController;
  let userRepo: Repository<UserEntityFixture>;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [AppModuleFixture],
    }).compile();

    userModule = testModule.get<UserModule>(UserModule);
    userRepo = testModule.get(
      getDynamicRepositoryToken(USER_MODULE_USER_ENTITY_KEY),
    );
    userLookupService =
      testModule.get<DefaultUserLookupService>(UserLookupService);
    userMutateService =
      testModule.get<DefaultUserMutateService>(UserMutateService);
    userCrudService = testModule.get<UserCrudService>(UserCrudService);
    userController = testModule.get<UserController>(UserController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('module', () => {
    it('should be loaded', async () => {
      expect(userModule).toBeInstanceOf(UserModule);
      expect(userRepo).toBeInstanceOf(Repository);
      expect(userCrudService).toBeInstanceOf(UserCrudService);
      expect(userLookupService).toBeInstanceOf(DefaultUserLookupService);
      expect(userLookupService['repo']).toBeInstanceOf(Repository);
      expect(userLookupService['repo'].find).toBeInstanceOf(Function);
      expect(userMutateService).toBeInstanceOf(DefaultUserMutateService);
      expect(userMutateService['repo']).toBeInstanceOf(Repository);
      expect(userMutateService['repo'].find).toBeInstanceOf(Function);
      expect(userController).toBeInstanceOf(UserController);
    });
  });
});

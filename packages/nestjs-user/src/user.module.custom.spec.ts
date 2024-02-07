import { Test, TestingModule } from '@nestjs/testing';
import { UserCrudService } from './services/user-crud.service';
import { UserMutateService } from './services/user-mutate.service';
import { UserPasswordService } from './services/user-password.service';
import { UserController } from './user.controller';

import { AppModuleCustomFixture } from './__fixtures__/app.module.custom.fixture';
import { UserLookupCustomService } from './__fixtures__/services/user-lookup.custom.service';
import { UserModuleCustomFixture } from './__fixtures__/user.module.custom.fixture';

describe('AppModule', () => {
  let userModule: UserModuleCustomFixture;
  let userLookupService: UserLookupCustomService;
  let userCrudService: UserCrudService;
  let userController: UserController;
  let userMutateService: UserMutateService;
  let userPasswordService: UserPasswordService;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [AppModuleCustomFixture],
    }).compile();

    userModule = testModule.get<UserModuleCustomFixture>(
      UserModuleCustomFixture,
    );
    userLookupService = testModule.get<UserLookupCustomService>(
      UserLookupCustomService,
    );
    userMutateService = testModule.get<UserMutateService>(UserMutateService);
    userPasswordService =
      testModule.get<UserPasswordService>(UserPasswordService);
    userCrudService = testModule.get<UserCrudService>(UserCrudService);
    userController = testModule.get<UserController>(UserController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('module', () => {
    it('should be loaded', async () => {
      expect(userModule).toBeInstanceOf(UserModuleCustomFixture);
      expect(userLookupService).toBeInstanceOf(UserLookupCustomService);
      expect(userMutateService).toBeInstanceOf(UserMutateService);
      expect(userPasswordService).toBeInstanceOf(UserPasswordService);
      expect(userCrudService).toBeInstanceOf(UserCrudService);
      expect(userController).toBeInstanceOf(UserController);
    });
  });
});

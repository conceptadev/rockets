import { Test, TestingModule } from '@nestjs/testing';
import { UserCrudService } from './services/user-crud.service';
import { UserModelService } from './services/user-model.service';
import { UserPasswordService } from './services/user-password.service';
import { UserController } from './user.controller';

import { AppModuleCustomFixture } from './__fixtures__/app.module.custom.fixture';
import { UserModelCustomService } from './__fixtures__/services/user-model.custom.service';
import { UserModuleCustomFixture } from './__fixtures__/user.module.custom.fixture';
import { UserModelServiceInterface } from './interfaces/user-model-service.interface';

describe('AppModule', () => {
  let testModule: TestingModule;
  let userModule: UserModuleCustomFixture;
  let userCrudService: UserCrudService;
  let userModelService: UserModelServiceInterface;
  let userModelCustomService: UserModelCustomService;
  let userController: UserController;
  let userPasswordService: UserPasswordService;

  beforeEach(async () => {
    testModule = await Test.createTestingModule({
      imports: [AppModuleCustomFixture],
    }).compile();

    userModule = testModule.get<UserModuleCustomFixture>(
      UserModuleCustomFixture,
    );
    userModelService = testModule.get<UserModelService>(UserModelService);
    userModelCustomService = testModule.get<UserModelCustomService>(
      UserModelCustomService,
    );
    userPasswordService =
      testModule.get<UserPasswordService>(UserPasswordService);
    userCrudService = testModule.get<UserCrudService>(UserCrudService);
    userController = testModule.get<UserController>(UserController);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    testModule && (await testModule.close());
  });

  describe('module', () => {
    it('should be loaded', async () => {
      expect(userModule).toBeInstanceOf(UserModuleCustomFixture);
      expect(userModelService).toBeInstanceOf(UserModelService);
      expect(userModelCustomService).toBeInstanceOf(UserModelCustomService);
      expect(userPasswordService).toBeInstanceOf(UserPasswordService);
      expect(userCrudService).toBeInstanceOf(UserCrudService);
      expect(userController).toBeInstanceOf(UserController);
    });
  });
});

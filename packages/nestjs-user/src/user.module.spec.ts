import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import {
  RepositoryInterface,
  getDynamicRepositoryToken,
} from '@concepta/nestjs-common';
import {
  PasswordCreationService,
  PasswordStorageService,
} from '@concepta/nestjs-password';

import {
  USER_MODULE_USER_ENTITY_KEY,
  USER_MODULE_USER_PASSWORD_HISTORY_ENTITY_KEY,
} from './user.constants';
import { UserModule } from './user.module';
import { UserCrudService } from './services/user-crud.service';
import { UserController } from './user.controller';
import { UserModelService } from './services/user-model.service';
import { UserPasswordService } from './services/user-password.service';
import { UserModelServiceInterface } from './interfaces/user-model-service.interface';
import { UserPasswordHistoryService } from './services/user-password-history.service';
import { UserPasswordHistoryModelService } from './services/user-password-history-model.service';
import { UserAccessQueryService } from './services/user-access-query.service';

import { AppModuleFixture } from './__fixtures__/app.module.fixture';
import { UserEntityFixture } from './__fixtures__/user.entity.fixture';

describe('AppModule', () => {
  let testModule: TestingModule;
  let userModule: UserModule;
  let userCrudService: UserCrudService;
  let userModelService: UserModelServiceInterface;
  let userPasswordService: UserPasswordService;
  let userPasswordHistoryService: UserPasswordHistoryService;
  let userPasswordHistoryModelService: UserPasswordHistoryModelService;
  let userAccessQueryService: UserAccessQueryService;
  let userController: UserController;
  let userRepo: RepositoryInterface<UserEntityFixture>;
  let userPasswordHistoryRepo: RepositoryInterface<UserEntityFixture>;

  beforeEach(async () => {
    testModule = await Test.createTestingModule({
      imports: [AppModuleFixture],
    }).compile();

    userModule = testModule.get<UserModule>(UserModule);
    userRepo = testModule.get(
      getDynamicRepositoryToken(USER_MODULE_USER_ENTITY_KEY),
    );
    userPasswordHistoryRepo = testModule.get(
      getDynamicRepositoryToken(USER_MODULE_USER_PASSWORD_HISTORY_ENTITY_KEY),
    );
    userModelService = testModule.get<UserModelService>(UserModelService);
    userPasswordService =
      testModule.get<UserPasswordService>(UserPasswordService);
    userPasswordHistoryService = testModule.get<UserPasswordHistoryService>(
      UserPasswordHistoryService,
    );
    userPasswordHistoryModelService =
      testModule.get<UserPasswordHistoryModelService>(
        UserPasswordHistoryModelService,
      );
    userAccessQueryService = testModule.get<UserAccessQueryService>(
      UserAccessQueryService,
    );
    userCrudService = testModule.get<UserCrudService>(UserCrudService);
    userController = testModule.get<UserController>(UserController);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    testModule && (await testModule.close());
  });

  describe('module', () => {
    it('should be loaded', async () => {
      expect(userModule).toBeInstanceOf(UserModule);
      expect(userRepo).toBeInstanceOf(Repository);
      expect(userPasswordHistoryRepo).toBeInstanceOf(Repository);
      expect(userCrudService).toBeInstanceOf(UserCrudService);
      expect(userModelService).toBeInstanceOf(UserModelService);
      expect(userPasswordService).toBeInstanceOf(UserPasswordService);
      expect(userPasswordService['userModelService']).toBeInstanceOf(
        UserModelService,
      );
      expect(userPasswordService['passwordCreationService']).toBeInstanceOf(
        PasswordCreationService,
      );
      expect(userPasswordService['passwordStorageService']).toBeInstanceOf(
        PasswordStorageService,
      );
      expect(userPasswordService['userPasswordHistoryService']).toBeInstanceOf(
        UserPasswordHistoryService,
      );
      expect(userPasswordHistoryService).toBeInstanceOf(
        UserPasswordHistoryService,
      );
      expect(
        userPasswordHistoryService['userPasswordHistoryModelService'],
      ).toBeInstanceOf(UserPasswordHistoryModelService);
      expect(userPasswordHistoryModelService).toBeInstanceOf(
        UserPasswordHistoryModelService,
      );
      expect(
        userPasswordHistoryModelService['userPasswordHistoryRepo'],
      ).toBeInstanceOf(Repository);
      expect(userAccessQueryService).toBeInstanceOf(UserAccessQueryService);
      expect(userController).toBeInstanceOf(UserController);
    });
  });
});

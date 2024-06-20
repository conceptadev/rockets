import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { getDynamicRepositoryToken } from '@concepta/nestjs-typeorm-ext';
import { PasswordCreationService } from '@concepta/nestjs-password';

import {
  USER_MODULE_USER_ENTITY_KEY,
  USER_MODULE_USER_PASSWORD_HISTORY_ENTITY_KEY,
} from './user.constants';
import { UserModule } from './user.module';
import { UserCrudService } from './services/user-crud.service';
import { UserController } from './user.controller';
import { UserLookupService } from './services/user-lookup.service';
import { UserMutateService } from './services/user-mutate.service';
import { UserPasswordService } from './services/user-password.service';
import { UserPasswordHistoryService } from './services/user-password-history.service';
import { UserPasswordHistoryLookupService } from './services/user-password-history-lookup.service';
import { UserPasswordHistoryMutateService } from './services/user-password-history-mutate.service';
import { UserAccessQueryService } from './services/user-access-query.service';

import { AppModuleFixture } from './__fixtures__/app.module.fixture';
import { UserEntityFixture } from './__fixtures__/user.entity.fixture';

describe('AppModule', () => {
  let userModule: UserModule;
  let userLookupService: UserLookupService;
  let userMutateService: UserMutateService;
  let userCrudService: UserCrudService;
  let userPasswordService: UserPasswordService;
  let userPasswordHistoryService: UserPasswordHistoryService;
  let userPasswordHistoryLookupService: UserPasswordHistoryLookupService;
  let userPasswordHistoryMutateService: UserPasswordHistoryMutateService;
  let userAccessQueryService: UserAccessQueryService;
  let userController: UserController;
  let userRepo: Repository<UserEntityFixture>;
  let userPasswordHistoryRepo: Repository<UserEntityFixture>;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [AppModuleFixture],
    }).compile();

    userModule = testModule.get<UserModule>(UserModule);
    userRepo = testModule.get(
      getDynamicRepositoryToken(USER_MODULE_USER_ENTITY_KEY),
    );
    userPasswordHistoryRepo = testModule.get(
      getDynamicRepositoryToken(USER_MODULE_USER_PASSWORD_HISTORY_ENTITY_KEY),
    );
    userLookupService = testModule.get<UserLookupService>(UserLookupService);
    userMutateService = testModule.get<UserMutateService>(UserMutateService);
    userPasswordService =
      testModule.get<UserPasswordService>(UserPasswordService);
    userPasswordHistoryService = testModule.get<UserPasswordHistoryService>(
      UserPasswordHistoryService,
    );
    userPasswordHistoryLookupService =
      testModule.get<UserPasswordHistoryLookupService>(
        UserPasswordHistoryLookupService,
      );
    userPasswordHistoryMutateService =
      testModule.get<UserPasswordHistoryMutateService>(
        UserPasswordHistoryMutateService,
      );
    userAccessQueryService = testModule.get<UserAccessQueryService>(
      UserAccessQueryService,
    );
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
      expect(userPasswordHistoryRepo).toBeInstanceOf(Repository);
      expect(userCrudService).toBeInstanceOf(UserCrudService);
      expect(userLookupService).toBeInstanceOf(UserLookupService);
      expect(userLookupService['repo']).toBeInstanceOf(Repository);
      expect(userLookupService['repo'].find).toBeInstanceOf(Function);
      expect(userMutateService).toBeInstanceOf(UserMutateService);
      expect(userMutateService['repo']).toBeInstanceOf(Repository);
      expect(userMutateService['repo'].find).toBeInstanceOf(Function);
      expect(userMutateService['userPasswordService']).toBeInstanceOf(
        UserPasswordService,
      );
      expect(userPasswordService).toBeInstanceOf(UserPasswordService);
      expect(userPasswordService['userLookupService']).toBeInstanceOf(
        UserLookupService,
      );
      expect(userPasswordService['passwordCreationService']).toBeInstanceOf(
        PasswordCreationService,
      );
      expect(userPasswordService['userPasswordHistoryService']).toBeInstanceOf(
        UserPasswordHistoryService,
      );
      expect(userPasswordHistoryService).toBeInstanceOf(
        UserPasswordHistoryService,
      );
      expect(
        userPasswordHistoryService['userPasswordHistoryLookupService'],
      ).toBeInstanceOf(UserPasswordHistoryLookupService);
      expect(
        userPasswordHistoryService['userPasswordHistoryMutateService'],
      ).toBeInstanceOf(UserPasswordHistoryMutateService);
      expect(userPasswordHistoryLookupService).toBeInstanceOf(
        UserPasswordHistoryLookupService,
      );
      expect(
        userPasswordHistoryLookupService['userPasswordHistoryRepo'],
      ).toBeInstanceOf(Repository);
      expect(userPasswordHistoryMutateService).toBeInstanceOf(
        UserPasswordHistoryMutateService,
      );
      expect(
        userPasswordHistoryMutateService['userPasswordHistoryRepo'],
      ).toBeInstanceOf(Repository);
      expect(userAccessQueryService).toBeInstanceOf(UserAccessQueryService);
      expect(userController).toBeInstanceOf(UserController);
    });
  });
});

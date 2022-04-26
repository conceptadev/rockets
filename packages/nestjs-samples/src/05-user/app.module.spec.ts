import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { AppModule } from './app.module';
import {
  User,
  UserModule,
  UserRepository,
  UserService,
  UserController,
  UserLookupService,
  UserCrudService,
  UserMutateService,
} from '@concepta/nestjs-user';
import { DefaultUserService } from '@concepta/nestjs-user/dist/services/default-user.service';
import { DefaultUserLookupService } from '@concepta/nestjs-user/dist/services/default-user-lookup.service';
import { DefaultUserMutateService } from '@concepta/nestjs-user/dist/services/default-user-mutate.service';

describe('AppModule', () => {
  let userModule: UserModule;
  let userService: DefaultUserService;
  let userLookupService: DefaultUserLookupService;
  let userMutateService: DefaultUserMutateService;
  let userCrudService: UserCrudService;
  let userController: UserController;
  let userEntityRepo: Repository<User>;
  let userCustomRepo: UserRepository;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    userModule = testModule.get<UserModule>(UserModule);
    userEntityRepo = testModule.get<Repository<User>>(
      'USER_MODULE_USER_ENTITY_REPO_TOKEN',
    );
    userCustomRepo = testModule.get<UserRepository>(
      'USER_MODULE_USER_CUSTOM_REPO_TOKEN',
    );
    userService = testModule.get<DefaultUserService>(UserService);
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
      expect(userEntityRepo).toBeInstanceOf(Repository);
      expect(userCustomRepo).toBeInstanceOf(UserRepository);
      expect(userService).toBeInstanceOf(DefaultUserService);
      expect(userCrudService).toBeInstanceOf(UserCrudService);
      expect(userLookupService).toBeInstanceOf(DefaultUserLookupService);
      expect(userLookupService['userRepo']).toBeInstanceOf(UserRepository);
      expect(userLookupService['userRepo'].find).toBeInstanceOf(Function);
      expect(userMutateService).toBeInstanceOf(DefaultUserMutateService);
      expect(userMutateService['repo']).toBeInstanceOf(UserRepository);
      expect(userMutateService['repo'].find).toBeInstanceOf(Function);
      expect(userController).toBeInstanceOf(UserController);
    });
  });
});

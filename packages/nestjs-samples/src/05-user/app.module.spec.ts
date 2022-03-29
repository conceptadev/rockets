import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import {
  User,
  UserModule,
  UserRepository,
  UserService,
  UserController,
  UserLookupService,
  UserCrudService,
  DefaultUserService,
} from '@concepta/nestjs-user';
import { AppModule } from './app.module';

describe('AppModule', () => {
  let userModule: UserModule;
  let userService: DefaultUserService;
  let userLookupService: UserLookupService;
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
    userLookupService = testModule.get<UserLookupService>(UserLookupService);
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
      expect(userLookupService.userRepo).toBeInstanceOf(UserRepository);
      expect(userLookupService.userRepo.find).toBeInstanceOf(Function);
      expect(userController).toBeInstanceOf(UserController);
    });
  });
});

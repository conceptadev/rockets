import { Test, TestingModule } from '@nestjs/testing';
import {
  User,
  UserModule,
  UserRepository,
  UserService,
  UserController,
  DefaultUserService,
} from '@rockts-org/nestjs-user';
import { Repository } from 'typeorm';
import { AppModule } from './app.module';

describe('AppModule', () => {
  let userModule: UserModule;
  let userService: DefaultUserService;
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
      expect(userService.userRepo).toBeInstanceOf(UserRepository);
      expect(userService.userRepo.find).toBeInstanceOf(Function);
      expect(userController).toBeInstanceOf(UserController);
    });
  });
});

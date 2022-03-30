import { Test, TestingModule } from '@nestjs/testing';
import {
  UserModule,
  UserService,
  UserLookupService,
} from '@concepta/nestjs-user';
import { UserController } from '@concepta/nestjs-user';
import { Repository } from 'typeorm';
import { AppModule } from './app.module';
import { CustomUserRepository } from './custom-repository';
import { CustomUser } from './custom-user.entity';

describe('AppModule', () => {
  let userModule: UserModule;
  let userService: UserService;
  let userLookupService: UserLookupService;
  let userController: UserController;
  let userEntityRepo: Repository<CustomUser>;
  let userCustomRepo: CustomUserRepository;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    userModule = testModule.get<UserModule>(UserModule);
    userEntityRepo = testModule.get<Repository<CustomUser>>(
      'USER_MODULE_USER_ENTITY_REPO_TOKEN',
    );
    userCustomRepo = testModule.get<CustomUserRepository>(
      'USER_MODULE_USER_CUSTOM_REPO_TOKEN',
    );
    userService = testModule.get<UserService>(UserService);
    userLookupService = testModule.get<UserLookupService>(UserLookupService);
    userController = testModule.get<UserController>(UserController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('module', () => {
    it('should be loaded', async () => {
      expect(userModule).toBeInstanceOf(UserModule);
      expect(userEntityRepo).toBeInstanceOf(Repository);
      expect(userCustomRepo).toBeInstanceOf(CustomUserRepository);
      expect(userService).toBeInstanceOf(UserService);
      expect(userLookupService).toBeInstanceOf(UserLookupService);
      expect(userLookupService.userRepo).toBeInstanceOf(CustomUserRepository);
      expect(userLookupService.userRepo.find).toBeInstanceOf(Function);
      expect(userController).toBeInstanceOf(UserController);
    });
  });
});

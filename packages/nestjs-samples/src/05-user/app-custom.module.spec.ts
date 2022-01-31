import { Test, TestingModule } from '@nestjs/testing';
import {
  UserService,
  UserController,
  UserCrudService,
} from '@rockts-org/nestjs-user';
import { CustomAppModule } from './app-custom.module';
import { CustomUserModule } from './custom-user/custom-user.module';
import { CustomUserService } from './custom-user/custom-user.service';

describe('AppModule', () => {
  let userModule: CustomUserModule;
  let userService: CustomUserService;
  let userCrudService: UserCrudService;
  let userController: UserController;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [CustomAppModule],
    }).compile();

    userModule = testModule.get<CustomUserModule>(CustomUserModule);
    userService = testModule.get<CustomUserService>(UserService);
    userCrudService = testModule.get<UserCrudService>(UserCrudService);
    userController = testModule.get<UserController>(UserController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('module', () => {
    it('should be loaded', async () => {
      expect(userModule).toBeInstanceOf(CustomUserModule);
      expect(userService).toBeInstanceOf(CustomUserService);
      expect(userCrudService).toBeInstanceOf(UserCrudService);
      expect(userController).toBeInstanceOf(UserController);
      expect(userController['userService']).toBeInstanceOf(CustomUserService);
    });
  });
});

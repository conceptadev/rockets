import { Test, TestingModule } from '@nestjs/testing';
import { UserService, UserController } from '@rockts-org/nestjs-user';
import { CustomAppModule } from './app-custom.module';
import { CustomUserModule } from './custom-user/custom-user.module';
import { CustomUserService } from './custom-user/custom-user.service';

describe('AppModule', () => {
  let userModule: CustomUserModule;
  let userService: CustomUserService;
  let userController: UserController;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [CustomAppModule],
    }).compile();

    userModule = testModule.get<CustomUserModule>(CustomUserModule);
    userService = testModule.get<CustomUserService>(UserService);
    userController = testModule.get<UserController>(UserController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('module', () => {
    it('should be loaded', async () => {
      expect(userModule).toBeInstanceOf(CustomUserModule);
      expect(userService).toBeInstanceOf(CustomUserService);
      expect(userController).toBeInstanceOf(UserController);
      expect(userController['userService']).toBeInstanceOf(CustomUserService);
    });
  });
});

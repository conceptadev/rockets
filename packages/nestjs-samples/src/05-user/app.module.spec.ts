import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { UserModule } from '@rockts-org/nestjs-user';
import { UserService } from '@rockts-org/nestjs-user';
import { UserController } from '@rockts-org/nestjs-user';
import { AppModule } from './app.module';

describe('AppModule', () => {
  let userModule: UserModule;
  let userService: UserService;
  let userController: UserController;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    userModule = testModule.get<UserModule>(UserModule);
    userService = testModule.get<UserService>(UserService);
    userController = testModule.get<UserController>(UserController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('module', () => {
    it('should be loaded', async () => {
      expect(userModule).toBeInstanceOf(UserModule);
      expect(userService).toBeInstanceOf(UserService);
      expect(userService.userRepo).toBeInstanceOf(Repository);
      expect(userController).toBeInstanceOf(UserController);

      console.error(await userService.userRepo.find());
    });
  });
});

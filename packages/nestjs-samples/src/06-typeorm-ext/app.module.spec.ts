import { Test, TestingModule } from '@nestjs/testing';
import { UserModule, UserLookupService } from '@concepta/nestjs-user';
import { UserController } from '@concepta/nestjs-user';
import { AppModule } from './app.module';
import { UserRepository } from './user/user.repository';
import { getDynamicRepositoryToken } from '@concepta/nestjs-typeorm-ext';

describe('AppModule', () => {
  let userModule: UserModule;
  let userLookupService: UserLookupService;
  let userController: UserController;
  let userRepo: UserRepository;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    userModule = testModule.get<UserModule>(UserModule);
    userRepo = testModule.get<UserRepository>(
      getDynamicRepositoryToken('user'),
    );
    userLookupService = testModule.get<UserLookupService>(UserLookupService);
    userController = testModule.get<UserController>(UserController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('module', () => {
    it('should be loaded', async () => {
      expect(userModule).toBeInstanceOf(UserModule);
      expect(userRepo).toBeInstanceOf(UserRepository);
      expect(userLookupService).toBeInstanceOf(UserLookupService);
      expect(userLookupService['userRepo']).toBeInstanceOf(UserRepository);
      expect(userLookupService['userRepo'].find).toBeInstanceOf(Function);
      expect(userController).toBeInstanceOf(UserController);
    });
  });
});

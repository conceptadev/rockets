import { Test, TestingModule } from '@nestjs/testing';
import { UserModule, UserLookupService } from '@concepta/nestjs-user';
import { UserController } from '@concepta/nestjs-user';
import { Repository } from 'typeorm';
import { AppModule } from './app.module';
import { UserRepository } from './user/user.repository';
import { UserEntity } from './user/user.entity';

describe('AppModule', () => {
  let userModule: UserModule;
  let userLookupService: UserLookupService;
  let userController: UserController;
  let userEntityRepo: Repository<UserEntity>;
  let userCustomRepo: UserRepository;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    userModule = testModule.get<UserModule>(UserModule);
    userEntityRepo = testModule.get<Repository<UserEntity>>(
      'USER_MODULE_USER_ENTITY_REPO_TOKEN',
    );
    userCustomRepo = testModule.get<UserRepository>(
      'USER_MODULE_USER_CUSTOM_REPO_TOKEN',
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
      expect(userEntityRepo).toBeInstanceOf(Repository);
      expect(userCustomRepo).toBeInstanceOf(UserRepository);
      expect(userLookupService).toBeInstanceOf(UserLookupService);
      expect(userLookupService['userRepo']).toBeInstanceOf(UserRepository);
      expect(userLookupService['userRepo'].find).toBeInstanceOf(Function);
      expect(userController).toBeInstanceOf(UserController);
    });
  });
});

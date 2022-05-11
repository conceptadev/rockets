import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { AppModule } from './app.module';
import {
  UserModule,
  UserRepository,
  UserController,
  UserLookupService,
  UserCrudService,
  UserMutateService,
} from '@concepta/nestjs-user';
import { DefaultUserLookupService } from '@concepta/nestjs-user/dist/services/default-user-lookup.service';
import { DefaultUserMutateService } from '@concepta/nestjs-user/dist/services/default-user-mutate.service';
import { MyUserRepository } from './custom-user/my-user.repository';
import { MyUser } from './custom-user/my-user.entity';

describe('AppModule', () => {
  let userModule: UserModule;
  let userLookupService: DefaultUserLookupService;
  let userMutateService: DefaultUserMutateService;
  let userCrudService: UserCrudService;
  let userController: UserController;
  let userEntityRepo: Repository<MyUser>;
  let userCustomRepo: MyUserRepository;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    userModule = testModule.get<UserModule>(UserModule);
    userEntityRepo = testModule.get<Repository<MyUser>>(
      'USER_MODULE_USER_ENTITY_REPO_TOKEN',
    );
    userCustomRepo = testModule.get<UserRepository>(
      'USER_MODULE_USER_CUSTOM_REPO_TOKEN',
    );
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
      expect(userCustomRepo).toBeInstanceOf(MyUserRepository);
      expect(userCrudService).toBeInstanceOf(UserCrudService);
      expect(userLookupService).toBeInstanceOf(DefaultUserLookupService);
      expect(userLookupService['userRepo']).toBeInstanceOf(MyUserRepository);
      expect(userLookupService['userRepo'].find).toBeInstanceOf(Function);
      expect(userMutateService).toBeInstanceOf(DefaultUserMutateService);
      expect(userMutateService['repo']).toBeInstanceOf(MyUserRepository);
      expect(userMutateService['repo'].find).toBeInstanceOf(Function);
      expect(userController).toBeInstanceOf(UserController);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import {
  RepositoryInterface,
  getDynamicRepositoryToken,
} from '@concepta/nestjs-common';
import { UserModule, UserModelService } from '@concepta/nestjs-user';
import { AppModule } from './app.module';
import { UserEntity } from './user/user.entity';
import { TypeOrmRepositoryAdapter } from '@concepta/nestjs-typeorm-ext';

describe('AppModule', () => {
  let userModule: UserModule;
  let userModelService: UserModelService;
  let userRepo: RepositoryInterface<UserEntity>;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    userModule = testModule.get<UserModule>(UserModule);
    userRepo = testModule.get(getDynamicRepositoryToken('user'));
    userModelService = testModule.get<UserModelService>(UserModelService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('module', () => {
    it('should be loaded', async () => {
      expect(userModule).toBeInstanceOf(UserModule);
      expect(userRepo).toBeInstanceOf(TypeOrmRepositoryAdapter);
      expect(userModelService).toBeInstanceOf(UserModelService);
      expect(userModelService['repo']).toBeInstanceOf(TypeOrmRepositoryAdapter);
      expect(userModelService['repo'].find).toBeInstanceOf(Function);
    });
  });
});

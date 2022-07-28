import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import {
  getDynamicRepositoryToken,
  getEntityRepositoryToken,
  TypeOrmExtModule,
} from '@concepta/nestjs-typeorm-ext';
import { AuthenticationModule } from '@concepta/nestjs-authentication';
import { JwtModule } from '@concepta/nestjs-jwt';
import { CrudModule } from '@concepta/nestjs-crud';
import {
  UserLookupService,
  UserModule,
  UserMutateService,
} from '@concepta/nestjs-user';

import { FederatedModule } from './federated.module';
import { FederatedService } from './services/federated.service';
import { FederatedOAuthService } from './services/federated-oauth.service';
import { FEDERATED_MODULE_FEDERATED_ENTITY_KEY } from './federated.constants';

import { FederatedEntityFixture } from './__fixtures__/federated-entity.fixture';
import { FederatedEntityInterface } from './interfaces/federated-entity.interface';
import { UserEntityFixture } from './__fixtures__/user.entity.fixture';
import { FederatedMutateService } from './services/federated-mutate.service';

describe('FederatedModuleTest', () => {
  let federatedModule: FederatedModule;
  let federatedService: FederatedService;
  let federatedOauthService: FederatedOAuthService;
  let userLookupService: UserLookupService;
  let userMutateService: UserMutateService;
  let federatedEntityRepo: Repository<FederatedEntityInterface>;
  let federatedDynamicRepo: Repository<FederatedEntityInterface>;
  let federatedMutateService: FederatedMutateService;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmExtModule.register({
          type: 'sqlite',
          database: ':memory:',
          synchronize: true,
          entities: [UserEntityFixture, FederatedEntityFixture],
        }),
        AuthenticationModule.register(),
        JwtModule.forRoot({}),
        CrudModule.register(),
        FederatedModule.registerAsync({
          imports: [UserModule.deferred()],
          inject: [UserLookupService, UserMutateService],
          useFactory: (userLookupService, userMutateService) => ({
            userLookupService,
            userMutateService,
          }),
          entities: {
            federated: {
              entity: FederatedEntityFixture,
            },
          },
        }),
        UserModule.register({
          entities: {
            user: {
              entity: UserEntityFixture,
            },
          },
        }),
      ],
    }).compile();

    federatedModule = testModule.get<FederatedModule>(FederatedModule);
    federatedService = testModule.get<FederatedService>(FederatedService);
    federatedOauthService = testModule.get<FederatedOAuthService>(
      FederatedOAuthService,
    );
    federatedEntityRepo = testModule.get<Repository<FederatedEntityFixture>>(
      getEntityRepositoryToken(FEDERATED_MODULE_FEDERATED_ENTITY_KEY),
    );
    federatedDynamicRepo = testModule.get(
      getDynamicRepositoryToken(FEDERATED_MODULE_FEDERATED_ENTITY_KEY),
    );
    userLookupService = testModule.get<UserLookupService>(UserLookupService);
    userMutateService = testModule.get<UserMutateService>(UserMutateService);
    federatedMutateService = testModule.get<FederatedMutateService>(
      FederatedMutateService,
    );
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  describe('module', () => {
    it('should be loaded', async () => {
      expect(federatedModule).toBeInstanceOf(FederatedModule);
      expect(federatedEntityRepo).toBeInstanceOf(Repository);
      expect(federatedDynamicRepo).toBeInstanceOf(Repository);
      expect(federatedService).toBeDefined();
      expect(federatedOauthService).toBeDefined();
      expect(userLookupService).toBeInstanceOf(UserLookupService);
      expect(userMutateService).toBeInstanceOf(UserMutateService);
      expect(federatedMutateService).toBeInstanceOf(FederatedMutateService);
    });
  });
});

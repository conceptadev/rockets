import { Repository } from 'typeorm';
import {
  DynamicModule,
  Inject,
  Injectable,
  Module,
  ModuleMetadata,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  getDynamicRepositoryToken,
  getEntityRepositoryToken,
  TypeOrmExtModule,
} from '@concepta/nestjs-typeorm-ext';

import { FederatedModule } from './federated.module';
import { FederatedService } from './services/federated.service';
import { FederatedOAuthService } from './services/federated-oauth.service';
import {
  FEDERATED_MODULE_FEDERATED_ENTITY_KEY,
  FEDERATED_MODULE_SETTINGS_TOKEN,
  FEDERATED_MODULE_USER_LOOKUP_SERVICE_TOKEN,
  FEDERATED_MODULE_USER_MUTATE_SERVICE_TOKEN,
} from './federated.constants';

import { FederatedSettingsInterface } from './interfaces/federated-settings.interface';
import { FederatedEntityInterface } from './interfaces/federated-entity.interface';
import { FederatedUserLookupServiceInterface } from './interfaces/federated-user-lookup-service.interface';
import { FederatedUserMutateServiceInterface } from './interfaces/federated-user-mutate-service.interface';
import { FederatedMutateService } from './services/federated-mutate.service';

import { UserModuleFixture } from './__fixtures__/user/user.module.fixture';
import { UserEntityFixture } from './__fixtures__/user/entities/user.entity.fixture';
import { UserLookupServiceFixture } from './__fixtures__/user/services/user-lookup.service.fixture';
import { UserMutateServiceFixture } from './__fixtures__/user/services/user-mutate.service.fixture';
import { FederatedEntityFixture } from './__fixtures__/federated/federated-entity.fixture';
import { RepositoryInterface } from '@concepta/typeorm-common';

describe(FederatedModule, () => {
  let testModule: TestingModule;
  let federatedModule: FederatedModule;
  let federatedService: FederatedService;
  let federatedOauthService: FederatedOAuthService;
  let userLookupService: FederatedUserLookupServiceInterface;
  let userMutateService: FederatedUserMutateServiceInterface;
  let federatedEntityRepo: RepositoryInterface<FederatedEntityInterface>;
  let federatedDynamicRepo: RepositoryInterface<FederatedEntityInterface>;
  let federatedMutateService: FederatedMutateService;

  describe(FederatedModule.forRoot, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          FederatedModule.forRoot({
            userLookupService: new UserLookupServiceFixture(),
            userMutateService: new UserMutateServiceFixture(),
            entities: {
              federated: {
                entity: FederatedEntityFixture,
              },
            },
          }),
        ]),
      ).compile();
    });

    it('module should be loaded', async () => {
      commonVars();
      commonTests();
    });
  });

  describe(FederatedModule.register, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          FederatedModule.register({
            userLookupService: new UserLookupServiceFixture(),
            userMutateService: new UserMutateServiceFixture(),
            entities: {
              federated: {
                entity: FederatedEntityFixture,
              },
            },
          }),
        ]),
      ).compile();
    });

    it('module should be loaded', async () => {
      commonVars();
      commonTests();
    });
  });

  describe(FederatedModule.forRootAsync, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          FederatedModule.forRootAsync({
            inject: [UserLookupServiceFixture, UserMutateServiceFixture],
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
        ]),
      ).compile();
    });

    it('module should be loaded', async () => {
      commonVars();
      commonTests();
    });
  });

  describe(FederatedModule.registerAsync, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          FederatedModule.registerAsync({
            inject: [UserLookupServiceFixture, UserMutateServiceFixture],
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
        ]),
      ).compile();
    });

    it('module should be loaded', async () => {
      commonVars();
      commonTests();
    });
  });

  describe(FederatedModule.forFeature, () => {
    @Module({})
    class GlobalModule {}

    @Module({})
    class ForFeatureModule {}

    @Injectable()
    class TestService {
      constructor(
        @Inject(FEDERATED_MODULE_SETTINGS_TOKEN)
        public settings: FederatedSettingsInterface,
        @Inject(FEDERATED_MODULE_USER_LOOKUP_SERVICE_TOKEN)
        public userLookupService: FederatedUserLookupServiceInterface,
        @Inject(FEDERATED_MODULE_USER_MUTATE_SERVICE_TOKEN)
        public userMutateService: FederatedUserMutateServiceInterface,
      ) {}
    }

    let testService: TestService;
    const ffUserLookupService = new UserLookupServiceFixture();
    const ffUserMutateService = new UserMutateServiceFixture();

    beforeEach(async () => {
      const globalModule = testModuleFactory([
        FederatedModule.forRootAsync({
          inject: [UserLookupServiceFixture, UserMutateServiceFixture],
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
      ]);

      testModule = await Test.createTestingModule({
        imports: [
          { module: GlobalModule, ...globalModule },
          {
            module: ForFeatureModule,
            imports: [
              FederatedModule.forFeature({
                userLookupService: ffUserLookupService,
                userMutateService: ffUserMutateService,
                entities: {
                  federated: {
                    entity: FederatedEntityFixture,
                  },
                },
              }),
            ],
            providers: [TestService],
          },
        ],
      }).compile();

      testService = testModule.get(TestService);
    });

    it('module should be loaded', async () => {
      commonVars();
      commonTests();
    });

    it('should have custom providers', async () => {
      commonVars();
      expect(testService.userLookupService).toBe(ffUserLookupService);
      expect(testService.userLookupService).not.toBe(userLookupService);
      expect(testService.userMutateService).toBe(ffUserMutateService);
      expect(testService.userMutateService).not.toBe(userMutateService);
    });
  });

  function commonVars() {
    federatedModule = testModule.get(FederatedModule);
    federatedService = testModule.get(FederatedService);
    federatedOauthService = testModule.get(FederatedOAuthService);
    federatedMutateService = testModule.get(FederatedMutateService);
    userLookupService = testModule.get<FederatedUserLookupServiceInterface>(
      UserLookupServiceFixture,
    );
    userMutateService = testModule.get<FederatedUserMutateServiceInterface>(
      UserMutateServiceFixture,
    );
    federatedEntityRepo = testModule.get<
      RepositoryInterface<FederatedEntityFixture>
    >(getEntityRepositoryToken(FEDERATED_MODULE_FEDERATED_ENTITY_KEY));
    federatedDynamicRepo = testModule.get(
      getDynamicRepositoryToken(FEDERATED_MODULE_FEDERATED_ENTITY_KEY),
    );
  }

  function commonTests() {
    expect(federatedModule).toBeInstanceOf(FederatedModule);
    expect(federatedService).toBeInstanceOf(FederatedService);
    expect(federatedMutateService).toBeInstanceOf(FederatedMutateService);
    expect(federatedOauthService).toBeInstanceOf(FederatedOAuthService);
    expect(userLookupService).toBeInstanceOf(UserLookupServiceFixture);
    expect(userMutateService).toBeInstanceOf(UserMutateServiceFixture);
    expect(federatedEntityRepo).toBeInstanceOf(Repository);
    expect(federatedDynamicRepo).toBeInstanceOf(Repository);
  }
});

function testModuleFactory(
  extraImports: DynamicModule['imports'] = [],
): ModuleMetadata {
  return {
    imports: [
      UserModuleFixture,
      TypeOrmExtModule.forRoot({
        type: 'sqlite',
        database: ':memory:',
        synchronize: true,
        entities: [UserEntityFixture, FederatedEntityFixture],
      }),
      ...extraImports,
    ],
  };
}

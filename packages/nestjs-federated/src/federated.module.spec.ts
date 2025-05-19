import { DynamicModule, ModuleMetadata } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  RepositoryInterface,
  getDynamicRepositoryToken,
} from '@concepta/nestjs-common';
import {
  TypeOrmExtModule,
  TypeOrmRepositoryAdapter,
} from '@concepta/nestjs-typeorm-ext';

import { FederatedModule } from './federated.module';
import { FederatedService } from './services/federated.service';
import { FederatedOAuthService } from './services/federated-oauth.service';
import { FEDERATED_MODULE_FEDERATED_ENTITY_KEY } from './federated.constants';

import { FederatedEntityInterface } from '@concepta/nestjs-common';
import { FederatedUserModelServiceInterface } from './interfaces/federated-user-model-service.interface';
import { FederatedModelService } from './services/federated-model.service';

import { UserModuleFixture } from './__fixtures__/user/user.module.fixture';
import { UserEntityFixture } from './__fixtures__/user/entities/user.entity.fixture';
import { UserModelServiceFixture } from './__fixtures__/user/services/user-model.service.fixture';
import { FederatedEntityFixture } from './__fixtures__/federated/federated-entity.fixture';

describe(FederatedModule, () => {
  let testModule: TestingModule;
  let federatedModule: FederatedModule;
  let federatedService: FederatedService;
  let federatedOauthService: FederatedOAuthService;
  let userModelService: FederatedUserModelServiceInterface;
  let federatedDynamicRepo: RepositoryInterface<FederatedEntityInterface>;
  let federatedModelService: FederatedModelService;

  describe(FederatedModule.forRoot, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          TypeOrmExtModule.forFeature({
            federated: {
              entity: FederatedEntityFixture,
            },
          }),
          FederatedModule.forRoot({
            userModelService: new UserModelServiceFixture(),
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
          TypeOrmExtModule.forFeature({
            federated: {
              entity: FederatedEntityFixture,
            },
          }),
          FederatedModule.register({
            userModelService: new UserModelServiceFixture(),
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
            imports: [
              TypeOrmExtModule.forFeature({
                federated: {
                  entity: FederatedEntityFixture,
                },
              }),
            ],
            inject: [UserModelServiceFixture],
            useFactory: (userModelService) => ({
              userModelService,
            }),
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
            imports: [
              TypeOrmExtModule.forFeature({
                federated: {
                  entity: FederatedEntityFixture,
                },
              }),
            ],
            inject: [UserModelServiceFixture],
            useFactory: (userModelService) => ({
              userModelService,
            }),
          }),
        ]),
      ).compile();
    });

    it('module should be loaded', async () => {
      commonVars();
      commonTests();
    });
  });

  function commonVars() {
    federatedModule = testModule.get(FederatedModule);
    federatedService = testModule.get(FederatedService);
    federatedOauthService = testModule.get(FederatedOAuthService);
    federatedModelService = testModule.get(FederatedModelService);
    userModelService = testModule.get<FederatedUserModelServiceInterface>(
      UserModelServiceFixture,
    );
    federatedDynamicRepo = testModule.get(
      getDynamicRepositoryToken(FEDERATED_MODULE_FEDERATED_ENTITY_KEY),
    );
  }

  function commonTests() {
    expect(federatedModule).toBeInstanceOf(FederatedModule);
    expect(federatedService).toBeInstanceOf(FederatedService);
    expect(federatedModelService).toBeInstanceOf(FederatedModelService);
    expect(federatedOauthService).toBeInstanceOf(FederatedOAuthService);
    expect(userModelService).toBeInstanceOf(UserModelServiceFixture);
    expect(federatedDynamicRepo).toBeInstanceOf(TypeOrmRepositoryAdapter);
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

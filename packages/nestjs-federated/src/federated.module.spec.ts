import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationModule } from '@concepta/nestjs-authentication';

import { mock } from 'jest-mock-extended';

import { FederatedModule } from './federated.module';
import { FederatedService } from './services/federated.service';
import { FederatedOAuthService } from './services/federated-oauth.service';
import { JwtModule } from '@concepta/nestjs-jwt';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';

import { ConnectionOptions, getConnectionManager } from 'typeorm';
import { Federated } from './entities/federated.entity';

describe('FederatedModuleTest', () => {
  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('is controller defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        FederatedModule.register(),
        JwtModule.register(),
        AuthenticationModule.register(),
        TypeOrmExtModule.registerAsync({
          useFactory: async () => {
            return {
              type: 'postgres',
            };
          },
          connectionFactory: async (options: ConnectionOptions) => {
            // TODO: update deprecated getConnectionManager
            const c = getConnectionManager().create(options);
            c['buildMetadatas']();
            return c;
          },
        }),
      ],
    })
      .overrideProvider('FEDERATED_MODULE_FEDERATED_ENTITY_REPO_TOKEN')
      .useValue(mock<Federated>())
      .overrideProvider('FEDERATED_MODULE_FEDERATED_CUSTOM_REPO_TOKEN')
      .useValue({})
      .overrideProvider('FEDERATED_MODULE_USER_LOOKUP_SERVICE_TOKEN')
      .useValue({})
      .overrideProvider('FEDERATED_MODULE_USER_MUTATE_SERVICE_TOKEN')
      .useValue({})

      .compile();

    const controller = module.get(FederatedService);
    const oauthService = module.get(FederatedOAuthService);

    expect(controller).toBeDefined();
    expect(oauthService).toBeDefined();
  });
});

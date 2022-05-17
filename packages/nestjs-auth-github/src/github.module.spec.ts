import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { AuthenticationModule } from '@concepta/nestjs-authentication';
import { JwtModule } from '@concepta/nestjs-jwt';
import { CrudModule } from '@concepta/nestjs-crud';
import {
  UserModule,
  UserLookupService,
  UserMutateService,
} from '@concepta/nestjs-user';
import { FederatedModule } from '@concepta/nestjs-federated';
import { GithubController } from './github.controller';
import { GithubModule } from './github.module';

import { FederatedEntityFixture } from './__fixtures__/federated-entity.fixture';
import { FederatedRepositoryFixture } from './__fixtures__/federated-repository.fixture';
import { UserEntityFixture } from './__fixtures__/user.entity.fixture';
import { UserRepositoryFixture } from './__fixtures__/user.repository.fixture';

describe('GithubModuleTest', () => {
  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('is controller defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmExtModule.register({
          type: 'sqlite',
          database: ':memory:',
        }),
        AuthenticationModule.register(),
        JwtModule.register(),
        GithubModule.register(),
        FederatedModule.registerAsync({
          imports: [UserModule.deferred()],
          inject: [UserLookupService, UserMutateService],
          useFactory: (userLookupService, userMutateService) => ({
            userLookupService,
            userMutateService,
          }),
          orm: {
            entities: { federated: { useClass: FederatedEntityFixture } },
            repositories: {
              federatedRepository: { useClass: FederatedRepositoryFixture },
            },
          },
        }),
        CrudModule.register(),
        UserModule.register({
          orm: {
            entities: { user: { useClass: UserEntityFixture } },
            repositories: {
              userRepository: { useClass: UserRepositoryFixture },
            },
          },
        }),
      ],
    }).compile();

    const controller = module.get(GithubController);
    expect(controller).toBeDefined();
  });
});

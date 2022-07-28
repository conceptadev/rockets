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
import { AuthGithubController } from './auth-github.controller';
import { AuthGithubModule } from './auth-github.module';

import { FederatedEntityFixture } from './__fixtures__/federated-entity.fixture';
import { UserEntityFixture } from './__fixtures__/user.entity.fixture';

describe('AuthGithubModuleTest', () => {
  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('is controller defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmExtModule.register({
          type: 'sqlite',
          database: ':memory:',
          entities: [UserEntityFixture, FederatedEntityFixture],
        }),
        AuthenticationModule.register(),
        JwtModule.forRoot({}),
        AuthGithubModule.register(),
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
        CrudModule.register(),
        UserModule.register({
          entities: {
            user: {
              entity: UserEntityFixture,
            },
          },
        }),
      ],
    }).compile();

    const controller = module.get(AuthGithubController);
    expect(controller).toBeDefined();
  });
});

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

describe(AuthGithubModule, () => {
  let authGithubModule: AuthGithubModule;
  let authGithubController: AuthGithubController;

  describe(AuthGithubModule.forRoot, () => {
    it('module should be loaded', async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          TypeOrmExtModule.forRoot({
            type: 'sqlite',
            database: ':memory:',
            entities: [UserEntityFixture, FederatedEntityFixture],
          }),
          JwtModule.forRoot({}),
          AuthGithubModule.forRoot({}),
          AuthenticationModule.forRoot({}),
          FederatedModule.forRootAsync({
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
          CrudModule.forRoot({}),
          UserModule.register({
            entities: {
              user: {
                entity: UserEntityFixture,
              },
            },
          }),
        ],
      }).compile();

      authGithubModule = module.get(AuthGithubModule);
      authGithubController = module.get(AuthGithubController);

      expect(authGithubModule).toBeInstanceOf(AuthGithubModule);
      expect(authGithubController).toBeInstanceOf(AuthGithubController);
    });
  });
});

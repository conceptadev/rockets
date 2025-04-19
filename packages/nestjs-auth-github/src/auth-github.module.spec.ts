import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { AuthenticationModule } from '@concepta/nestjs-authentication';
import { AuthJwtModule } from '@concepta/nestjs-auth-jwt';
import { JwtModule } from '@concepta/nestjs-jwt';
import { CrudModule } from '@concepta/nestjs-crud';
import { UserModule, UserModelService } from '@concepta/nestjs-user';
import { PasswordModule } from '@concepta/nestjs-password';
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
          AuthJwtModule.forRootAsync({
            inject: [UserModelService],
            useFactory: (userModelService) => ({
              userModelService,
            }),
          }),
          FederatedModule.forRootAsync({
            inject: [UserModelService],
            useFactory: (userModelService) => ({
              userLookupService: userModelService,
              userMutateService: userModelService,
            }),
            entities: {
              federated: {
                entity: FederatedEntityFixture,
              },
            },
          }),
          CrudModule.forRoot({}),
          PasswordModule.forRoot({}),
          UserModule.forRoot({
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

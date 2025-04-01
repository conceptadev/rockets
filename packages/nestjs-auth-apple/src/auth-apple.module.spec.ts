import {
  AuthenticationCoreModule,
  AuthJwtModule,
  JwtModule,
} from '@concepta/nestjs-authentication';
import { CrudModule } from '@concepta/nestjs-crud';
import { FederatedModule } from '@concepta/nestjs-federated';
import { PasswordModule } from '@concepta/nestjs-password';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import {
  UserLookupService,
  UserModule,
  UserMutateService,
} from '@concepta/nestjs-user';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthAppleController } from './auth-apple.controller';
import { AuthAppleModule } from './auth-apple.module';

import { FederatedEntityFixture } from './__fixtures__/federated-entity.fixture';
import { UserEntityFixture } from './__fixtures__/user.entity.fixture';

describe(AuthAppleModule, () => {
  let authAppleModule: AuthAppleModule;
  let authAppleController: AuthAppleController;

  describe(AuthAppleModule.forRoot, () => {
    it('module should be loaded', async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          TypeOrmExtModule.forRoot({
            type: 'sqlite',
            database: ':memory:',
            entities: [UserEntityFixture, FederatedEntityFixture],
          }),
          JwtModule.forRoot({}),
          AuthAppleModule.forRoot({}),
          AuthenticationCoreModule.forRoot({}),
          AuthJwtModule.forRootAsync({
            inject: [UserLookupService],
            useFactory: (userLookupService) => ({
              userLookupService,
            }),
          }),
          FederatedModule.forRootAsync({
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

      authAppleModule = module.get(AuthAppleModule);
      authAppleController = module.get(AuthAppleController);

      expect(authAppleModule).toBeInstanceOf(AuthAppleModule);
      expect(authAppleController).toBeInstanceOf(AuthAppleController);
    });
  });
});

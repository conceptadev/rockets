import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import {
  AuthenticationModule,
  AuthJwtModule,
  JwtModule,
} from '@concepta/nestjs-authentication';
import { CrudModule } from '@concepta/nestjs-crud';
import {
  UserModule,
  UserLookupService,
  UserMutateService,
} from '@concepta/nestjs-user';
import { PasswordModule } from '@concepta/nestjs-password';
import { FederatedModule } from '@concepta/nestjs-federated';
import { AuthGoogleController } from './auth-google.controller';
import { AuthGoogleModule } from './auth-google.module';

import { FederatedEntityFixture } from './__fixtures__/federated-entity.fixture';
import { UserEntityFixture } from './__fixtures__/user.entity.fixture';

describe(AuthGoogleModule, () => {
  let authGoogleModule: AuthGoogleModule;
  let authGoogleController: AuthGoogleController;

  describe(AuthGoogleModule.forRoot, () => {
    it('module should be loaded', async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          TypeOrmExtModule.forRoot({
            type: 'sqlite',
            database: ':memory:',
            entities: [UserEntityFixture, FederatedEntityFixture],
          }),
          JwtModule.forRoot({}),
          AuthGoogleModule.forRoot({}),
          AuthenticationModule.forRoot({}),
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

      authGoogleModule = module.get(AuthGoogleModule);
      authGoogleController = module.get(AuthGoogleController);

      expect(authGoogleModule).toBeInstanceOf(AuthGoogleModule);
      expect(authGoogleController).toBeInstanceOf(AuthGoogleController);
    });
  });
});

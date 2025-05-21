import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { AuthenticationModule } from '@concepta/nestjs-authentication';
import { AuthJwtModule } from '@concepta/nestjs-auth-jwt';
import { JwtModule } from '@concepta/nestjs-jwt';
import { CrudModule } from '@concepta/nestjs-crud';
import { UserModule, UserModelService } from '@concepta/nestjs-user';
import { PasswordModule } from '@concepta/nestjs-password';
import { FederatedModule } from '@concepta/nestjs-federated';
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
          AuthenticationModule.forRoot({}),
          AuthJwtModule.forRootAsync({
            inject: [UserModelService],
            useFactory: (userModelService) => ({
              userModelService,
            }),
          }),
          FederatedModule.forRootAsync({
            imports: [
              TypeOrmExtModule.forFeature({
                federated: {
                  entity: FederatedEntityFixture,
                },
              }),
            ],
            inject: [UserModelService],
            useFactory: (userModelService) => ({
              userModelService,
            }),
          }),
          CrudModule.forRoot({}),
          PasswordModule.forRoot({}),
          UserModule.forRootAsync({
            imports: [
              TypeOrmExtModule.forFeature({
                user: {
                  entity: UserEntityFixture,
                },
              }),
            ],
            useFactory: () => ({}),
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

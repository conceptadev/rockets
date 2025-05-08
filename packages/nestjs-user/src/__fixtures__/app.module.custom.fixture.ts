import { AccessControl } from 'accesscontrol';
import { Module } from '@nestjs/common';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { PasswordModule } from '@concepta/nestjs-password';
import { AuthenticationModule } from '@concepta/nestjs-authentication';
import { AuthJwtModule } from '@concepta/nestjs-auth-jwt';
import { JwtModule } from '@concepta/nestjs-jwt';
import { AccessControlModule } from '@concepta/nestjs-access-control';
import { EventModule } from '@concepta/nestjs-event';

import { UserModule } from '../user.module';
import { createUserRepositoryFixture } from './create-user-repository.fixture';
import { UserModuleCustomFixture } from './user.module.custom.fixture';
import { UserModelCustomService } from './services/user-model.custom.service';
import { ormConfig } from './ormconfig.fixture';
import { UserEntityFixture } from './user.entity.fixture';
import { UserResource } from '../user.types';
import { UserModelServiceInterface } from '../interfaces/user-model-service.interface';

const rules = new AccessControl();
rules
  .grant('user')
  .resource(UserResource.One)
  .createOwn()
  .readOwn()
  .updateOwn()
  .deleteOwn();

@Module({
  imports: [
    UserModuleCustomFixture,
    TypeOrmExtModule.forRoot(ormConfig),
    EventModule.forRoot({}),
    JwtModule.forRoot({}),
    AuthJwtModule.forRootAsync({
      inject: [UserModelCustomService],
      useFactory: (userModelService: UserModelServiceInterface) => ({
        userModelService,
      }),
    }),
    AuthenticationModule.forRoot({}),
    PasswordModule.forRoot({}),
    AccessControlModule.forRoot({ settings: { rules } }),
    UserModule.forRootAsync({
      imports: [
        TypeOrmExtModule.forFeature({
          user: {
            entity: UserEntityFixture,
            repositoryFactory: createUserRepositoryFixture,
          },
        }),
      ],
      inject: [UserModelCustomService],
      useFactory: async (userModelService: UserModelServiceInterface) => ({
        userModelService,
        settings: {
          passwordHistory: {
            enabled: true,
          },
        },
      }),
    }),
  ],
})
export class AppModuleCustomFixture {}

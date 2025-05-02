import { AccessControl } from 'accesscontrol';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Global, Module } from '@nestjs/common';
import { AuthenticationModule } from '@concepta/nestjs-authentication';
import { AccessControlModule } from '@concepta/nestjs-access-control';
import { JwtModule } from '@concepta/nestjs-jwt';
import { AuthJwtModule } from '@concepta/nestjs-auth-jwt';
import { CrudModule } from '@concepta/nestjs-crud';
import { EventModule } from '@concepta/nestjs-event';

import { UserResource } from '../user.types';
import { UserAccessQueryService } from '../services/user-access-query.service';

import { ormConfig } from './ormconfig.fixture';
import { UserCrudModelServiceFixture } from './services/user-crud-model.service.fixture';
import { UserCrudServiceFixture } from './services/user-crud.service.fixture';
import { UserEntityFixture } from './user.entity.fixture';
import { UserCrudControllerFixture } from './controllers/user-crud.controller.fixture';

const rules = new AccessControl();
rules
  .grant('user')
  .resource(UserResource.One)
  .createOwn()
  .readOwn()
  .updateOwn()
  .deleteOwn();

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot(ormConfig),
    TypeOrmModule.forFeature([UserEntityFixture]),
    CrudModule.forRoot({}),
    EventModule.forRoot({}),
    JwtModule.forRoot({}),
    AuthJwtModule.forRootAsync({
      inject: [UserCrudModelServiceFixture],
      useFactory: (userModelService: UserCrudModelServiceFixture) => ({
        userModelService,
      }),
    }),
    AuthenticationModule.forRoot({}),
    AccessControlModule.forRoot({
      settings: { rules },
      queryServices: [UserAccessQueryService],
    }),
  ],
  providers: [UserCrudModelServiceFixture, UserCrudServiceFixture],
  exports: [UserCrudModelServiceFixture, UserCrudServiceFixture],
  controllers: [UserCrudControllerFixture],
})
export class AppModuleCrudFixture {}

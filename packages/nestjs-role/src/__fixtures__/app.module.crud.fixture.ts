import { CrudModule } from '@concepta/nestjs-crud';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { UserRoleAssignmentCrudServiceFixture } from './service/user-role-assignment-crud.service.fixture';

import { ApiKeyEntityFixture } from './entities/api-key-entity.fixture';
import { ApiKeyRoleEntityFixture } from './entities/api-key-role-entity.fixture';
import { RoleEntityFixture } from './entities/role-entity.fixture';
import { UserEntityFixture } from './entities/user-entity.fixture';
import { UserRoleEntityFixture } from './entities/user-role-entity.fixture';
import { RoleControllerFixture } from './controller/role.controller.fixture';
import { ApiKeyAssignmentCrudServiceFixture } from './service/api-key-assignment-crud.service.fixture';
import { UserRoleAssignmentControllerFixture } from './controller/user-role-assignment.controller.fixture';
import { RoleCrudServiceFixture } from './service/role-crud.service.fixture';

@Module({
  imports: [
    // TypeOrmExtModule.forRoot({
    //   type: 'sqlite',
    //   database: ':memory:',
    //   synchronize: true,
    //   entities: [
    //     RoleEntityFixture,
    //     UserEntityFixture,
    //     UserRoleEntityFixture,
    //     ApiKeyEntityFixture,
    //     ApiKeyRoleEntityFixture,
    //   ],
    // }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      synchronize: true,
      entities: [
        RoleEntityFixture,
        UserEntityFixture,
        UserRoleEntityFixture,
        ApiKeyEntityFixture,
        ApiKeyRoleEntityFixture,
      ],
    }),
    TypeOrmModule.forFeature([
      RoleEntityFixture,
      UserEntityFixture,
      UserRoleEntityFixture,
      ApiKeyEntityFixture,
      ApiKeyRoleEntityFixture,
    ]),
    CrudModule.forRoot({}),
  ],
  controllers: [RoleControllerFixture, UserRoleAssignmentControllerFixture],
  providers: [
    RoleCrudServiceFixture,
    UserRoleAssignmentCrudServiceFixture,
    ApiKeyAssignmentCrudServiceFixture,
  ],
})
export class AppModuleCrudFixture {}

import { CrudModule } from '@concepta/nestjs-crud';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { Module } from '@nestjs/common';

import { RoleModule } from '../role.module';

import { ApiKeyEntityFixture } from './entities/api-key-entity.fixture';
import { ApiKeyRoleEntityFixture } from './entities/api-key-role-entity.fixture';
import { RoleEntityFixture } from './entities/role-entity.fixture';
import { UserEntityFixture } from './entities/user-entity.fixture';
import { UserRoleEntityFixture } from './entities/user-role-entity.fixture';

import { ApiKeyRoleRepositoryFixture } from './repositories/api-key-role-repository.fixture';
import { RoleRepositoryFixture } from './repositories/role-repository.fixture';
import { UserRoleRepositoryFixture } from './repositories/user-role-repository.fixture';

@Module({
  imports: [
    TypeOrmExtModule.registerAsync({
      useFactory: async () => ({
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
    }),
    RoleModule.register({
      entities: {
        role: {
          entity: RoleEntityFixture,
          repository: RoleRepositoryFixture,
        },
        user: {
          entity: UserRoleEntityFixture,
        },
        userRole: {
          entity: UserRoleEntityFixture,
          repository: UserRoleRepositoryFixture,
        },
        apiKey: {
          entity: ApiKeyEntityFixture,
        },
        apiKeyRole: {
          entity: ApiKeyRoleEntityFixture,
          repository: ApiKeyRoleRepositoryFixture,
        },
      },
    }),
    CrudModule.register(),
  ],
})
export class AppModuleFixture {}

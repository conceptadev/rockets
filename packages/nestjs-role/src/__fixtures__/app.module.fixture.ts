import { CrudModule } from '@concepta/nestjs-crud';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { Module } from '@nestjs/common';

import { RoleModule } from '../role.module';

import { ApiKeyEntityFixture } from './entities/api-key-entity.fixture';
import { ApiKeyRoleEntityFixture } from './entities/api-key-role-entity.fixture';
import { RoleEntityFixture } from './entities/role-entity.fixture';
import { UserEntityFixture } from './entities/user-entity.fixture';
import { UserRoleEntityFixture } from './entities/user-role-entity.fixture';

@Module({
  imports: [
    TypeOrmExtModule.forRoot({
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
    RoleModule.registerAsync({
      imports: [
        TypeOrmExtModule.forFeature({
          role: {
            entity: RoleEntityFixture,
          },
          userRole: {
            entity: UserRoleEntityFixture,
          },
          apiKeyRole: {
            entity: ApiKeyRoleEntityFixture,
          },
        }),
      ],
      entities: ['userRole', 'apiKeyRole'],
      useFactory: () => ({
        settings: {
          assignments: {
            user: { entityKey: 'userRole' },
            'api-key': { entityKey: 'apiKeyRole' },
          },
        },
      }),
    }),
    CrudModule.forRoot({}),
  ],
})
export class AppModuleFixture {}

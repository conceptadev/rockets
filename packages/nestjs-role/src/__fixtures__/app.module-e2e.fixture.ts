import { CrudModule } from '@concepta/nestjs-crud';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { Module, Provider } from '@nestjs/common';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RoleAssignmentInterface } from '@concepta/nestjs-common';

import { RoleModule } from '../role.module';
import { ROLE_MODULE_CRUD_SERVICES_TOKEN } from '../role.constants';
import { RoleAssignmentCrudService } from '../services/role-assignment-crud.service';

import { ApiKeyEntityFixture } from './entities/api-key-entity.fixture';
import { ApiKeyRoleEntityFixture } from './entities/api-key-role-entity.fixture';
import { RoleEntityFixture } from './entities/role-entity.fixture';
import { UserEntityFixture } from './entities/user-entity.fixture';
import { UserRoleEntityFixture } from './entities/user-role-entity.fixture';

/**
 * Factory function for creating the ROLE_MODULE_CRUD_SERVICES_TOKEN provider
 * with static entity names
 */
export function createRoleCrudServicesProvider(): Provider {
  return {
    provide: ROLE_MODULE_CRUD_SERVICES_TOKEN,
    useFactory: (
      userRoleRepo: Repository<RoleAssignmentInterface>,
      apiKeyRoleRepo: Repository<RoleAssignmentInterface>,
    ) => {
      const serviceInstances: Record<string, RoleAssignmentCrudService> = {};
      
      // Add static role assignments
      serviceInstances['userRole'] = new RoleAssignmentCrudService(
        userRoleRepo
      );
      serviceInstances['apiKeyRole'] = new RoleAssignmentCrudService(
        apiKeyRoleRepo
      );
      
      return serviceInstances;
    },
    inject: [
      getRepositoryToken(UserRoleEntityFixture),
      getRepositoryToken(ApiKeyRoleEntityFixture),
    ],
  };
}

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
      entities: {
        roleAssignments: ['userRole', 'apiKeyRole'],
      },
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
  providers: [createRoleCrudServicesProvider()],
  exports: [ROLE_MODULE_CRUD_SERVICES_TOKEN]

})
export class AppModuleE2EFixture {}

import { Module } from '@nestjs/common';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { CrudModule } from '@concepta/nestjs-crud';
import { UserModule } from '../user.module';
import { UserModuleCustomFixture } from './user.module.custom.fixture';
import { UserLookupCustomService } from './services/user-lookup.custom.service';

import { ormConfig } from './ormconfig.fixture';
import { UserEntityFixture } from './user.entity.fixture';
import { createUserRepositoryFixture } from './create-user-repository.fixture';

@Module({
  imports: [
    TypeOrmExtModule.register(ormConfig),
    CrudModule.register(),
    UserModule.registerAsync({
      imports: [UserModuleCustomFixture],
      inject: [UserLookupCustomService],
      useFactory: async (userLookupService: UserLookupCustomService) => ({
        userLookupService,
      }),
      entities: {
        user: {
          entity: UserEntityFixture,
          repositoryFactory: createUserRepositoryFixture,
        },
      },
    }),
  ],
})
export class AppModuleCustomFixture {}

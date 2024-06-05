import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { Module } from '@nestjs/common';

import { CacheModule } from '../cache.module';
import { UserEntityFixture } from './entities/user-entity.fixture';
import { UserCacheEntityFixture } from './entities/user-cache-entity.fixture';
import { CrudModule } from '@concepta/nestjs-crud';

@Module({
  imports: [
    TypeOrmExtModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      synchronize: true,
      entities: [UserEntityFixture, UserCacheEntityFixture],
    }),
    CacheModule.register({
      settings: {
        assignments: {
          user: { entityKey: 'userCache' },
        },
      },
      entities: {
        userCache: {
          entity: UserCacheEntityFixture,
        },
      },
    }),
    CrudModule.forRoot({}),
  ],
})
export class AppModuleFixture { }

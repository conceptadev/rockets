import { Module } from '@nestjs/common';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { CrudModule } from '@concepta/nestjs-crud';
import { APP_FILTER } from '@nestjs/core';
import { CacheModule } from '../cache.module';
import { UserEntityFixture } from './entities/user-entity.fixture';
import { UserCacheEntityFixture } from './entities/user-cache-entity.fixture';
import { ExceptionsFilter } from '@concepta/nestjs-exception';

@Module({
  imports: [
    TypeOrmExtModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      synchronize: true,
      entities: [UserEntityFixture, UserCacheEntityFixture],
    }),
    CacheModule.register({
      entities: {
        userCache: {
          entity: UserCacheEntityFixture,
        },
      },
      settings: {
        assignments: {
          user: { entityKey: 'userCache' },
        },
      },
    }),
    CrudModule.forRoot({}),
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ExceptionsFilter,
    },
  ],
})
export class AppModuleFixture {}

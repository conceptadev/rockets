import { APP_FILTER } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ExceptionsFilter } from '@concepta/nestjs-common';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { CacheModule } from '../cache.module';
import { UserEntityFixture } from './entities/user-entity.fixture';
import { UserCacheEntityFixture } from './entities/user-cache-entity.fixture';

@Module({
  imports: [
    TypeOrmExtModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      synchronize: true,
      entities: [UserEntityFixture, UserCacheEntityFixture],
    }),
    CacheModule.registerAsync({
      imports: [
        TypeOrmExtModule.forFeature({
          userCache: {
            entity: UserCacheEntityFixture,
          },
        }),
      ],
      useFactory: () => ({
        settings: {
          assignments: {
            user: { entityKey: 'userCache' },
          },
        },
      }),
      entities: ['userCache'],
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ExceptionsFilter,
    },
  ],
})
export class AppModuleFixture {}

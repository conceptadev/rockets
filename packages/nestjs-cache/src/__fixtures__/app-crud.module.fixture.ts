import { ExceptionsFilter } from '@concepta/nestjs-common';
import { CrudModule } from '@concepta/nestjs-crud';
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheCrudControllerFixture } from './cache-crud.controller.fixture';
import { CacheCrudServiceFixture } from './cache-crud.service.fixture';
import { UserCacheEntityFixture } from './entities/user-cache-entity.fixture';
import { UserEntityFixture } from './entities/user-entity.fixture';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      synchronize: true,
      entities: [UserEntityFixture, UserCacheEntityFixture],
    }),
    TypeOrmModule.forFeature([UserEntityFixture, UserCacheEntityFixture]),
    CrudModule.forRoot({}),
  ],
  controllers: [CacheCrudControllerFixture],
  providers: [
    CacheCrudServiceFixture,
    {
      provide: APP_FILTER,
      useClass: ExceptionsFilter,
    },
  ],
})
export class AppCrudModuleFixture {}

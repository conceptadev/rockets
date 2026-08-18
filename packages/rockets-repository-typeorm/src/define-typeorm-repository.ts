import type { DynamicModule, PlainLiteralObject, Type } from '@nestjs/common';
import { TypeOrmModule, type TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TypeOrmRepositoryModule } from '@concepta/nestjs-repository-typeorm';
import type { RepositoryBootstrap } from '@concepta/rockets-core';
import type {
  DynamicRepositoryModule,
  RepositoryProviderOptions,
} from '@concepta/nestjs-repository';
import { assertSingleTypeOrmInstance } from './assert-single-typeorm';

/**
 * TypeORM repository bootstrap whose root entity list is derived by the
 * Rockets planner from resources and integration contributions.
 */
export function defineTypeOrmRepository<
  Connection extends TypeOrmModuleOptions,
>(connection: Connection): RepositoryBootstrap {
  return {
    name: 'typeorm-bootstrap',

    forFeature(entities: RepositoryProviderOptions[]): DynamicRepositoryModule {
      return TypeOrmRepositoryModule.forFeature(entities);
    },

    forRoot(entities: ReadonlyArray<Type<PlainLiteralObject>>): DynamicModule {
      // Last point before Nest's opaque "could not find DataSource
      // element". Two copies of `typeorm` make that error the only
      // signal; this replaces it with the paths and the fix.
      assertSingleTypeOrmInstance();

      return TypeOrmModule.forRoot({
        ...connection,
        entities: [...entities],
      });
    },
  };
}

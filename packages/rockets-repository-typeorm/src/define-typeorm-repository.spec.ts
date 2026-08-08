import { afterEach, describe, expect, it, vi } from 'vitest';
import { TypeOrmModule, type TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TypeOrmRepositoryModule } from '@concepta/nestjs-repository-typeorm';

import * as TypeOrmAdapter from './index';

type TypeOrmRepositoryFeatureInput = Parameters<
  typeof TypeOrmRepositoryModule.forFeature
>[0];
type TypeOrmRepositoryFeatureModule = ReturnType<
  typeof TypeOrmRepositoryModule.forFeature
>;

class TypeOrmRepositorySpecEntity {
  id!: string;
}

describe('defineTypeOrmRepository', () => {
  afterEach(() => vi.restoreAllMocks());

  function define(connection: TypeOrmModuleOptions) {
    return (
      TypeOrmAdapter as unknown as {
        defineTypeOrmRepository: (options: TypeOrmModuleOptions) => {
          forFeature: typeof TypeOrmRepositoryModule.forFeature;
          forRoot: (
            entities: ReadonlyArray<typeof TypeOrmRepositorySpecEntity>,
          ) => unknown;
        };
      }
    ).defineTypeOrmRepository(connection);
  }

  it('is owned by the TypeORM adapter package and delegates feature registration', () => {
    const repository = define({ type: 'sqlite', database: ':memory:' });
    const entities: TypeOrmRepositoryFeatureInput = [
      { key: 'typeormRepositorySpec', entity: TypeOrmRepositorySpecEntity },
    ];
    const featureModule: TypeOrmRepositoryFeatureModule = {
      module: TypeOrmRepositorySpecEntity,
    };
    const forFeature = vi
      .spyOn(TypeOrmRepositoryModule, 'forFeature')
      .mockReturnValue(featureModule);

    expect(repository.forFeature(entities)).toBe(featureModule);
    expect(forFeature).toHaveBeenCalledWith(entities);
  });

  it('builds a TypeORM root module with the planner entity list', () => {
    const connection: TypeOrmModuleOptions = {
      type: 'sqlite',
      database: ':memory:',
      synchronize: true,
    };
    const repository = define(connection);
    const forRoot = vi.spyOn(TypeOrmModule, 'forRoot');

    repository.forRoot([TypeOrmRepositorySpecEntity]);

    expect(forRoot).toHaveBeenCalledWith({
      ...connection,
      entities: [TypeOrmRepositorySpecEntity],
    });
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import { TypeOrmModule, type TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TypeOrmRepositoryModule } from '@concepta/nestjs-repository-typeorm';

// Imported from the package index (not the module directly) so this spec fails
// to compile if `defineTypeOrmRepository` stops being part of the public
// surface — the bootstrap is owned by this package, not the server.
import { defineTypeOrmRepository } from './index';

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

  it('is owned by the TypeORM adapter package and delegates feature registration', () => {
    const repository = defineTypeOrmRepository({
      type: 'sqlite',
      database: ':memory:',
    });
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
    const repository = defineTypeOrmRepository(connection);
    const forRoot = vi.spyOn(TypeOrmModule, 'forRoot');

    repository.forRoot([TypeOrmRepositorySpecEntity]);

    expect(forRoot).toHaveBeenCalledWith({
      ...connection,
      entities: [TypeOrmRepositorySpecEntity],
    });
  });
});

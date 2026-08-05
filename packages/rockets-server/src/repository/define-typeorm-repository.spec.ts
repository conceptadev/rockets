import { TypeOrmModule, type TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TypeOrmRepositoryModule } from '@conceptadev/rockets-repository-typeorm';
import { defineTypeOrmRepository } from './define-typeorm-repository';

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
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('delegates feature registration to TypeOrmRepositoryModule', () => {
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
    const forFeature = jest
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
    const forRoot = jest.spyOn(TypeOrmModule, 'forRoot');

    repository.forRoot([TypeOrmRepositorySpecEntity]);

    expect(forRoot).toHaveBeenCalledWith({
      ...connection,
      entities: [TypeOrmRepositorySpecEntity],
    });
  });
});

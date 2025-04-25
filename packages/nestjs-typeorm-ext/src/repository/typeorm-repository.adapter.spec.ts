import { getDataSourceToken } from '@nestjs/typeorm';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ModelQueryException } from '@concepta/nestjs-common';
import { SeedingSource } from '@concepta/typeorm-seeding';

import { TypeOrmRepositoryAdapter } from './typeorm-repository.adapter';
import { AppModuleFixture } from '../__fixtures__/repository/app.module.fixture';
import { TestModuleFixture } from '../__fixtures__/repository/test.module.fixture';
import { TestEntityFixture } from '../__fixtures__/repository/test.entity.fixture';
import { TypeOrmRepositoryAdapterFixture } from '../__fixtures__/repository/services/typeorm-repository.adapter.fixture';

describe(TypeOrmRepositoryAdapter, () => {
  let app: INestApplication;
  let testModuleFixture: TestModuleFixture;
  let testService: TypeOrmRepositoryAdapter<TestEntityFixture>;
  let seedingSource: SeedingSource;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModuleFixture],
    }).compile();

    app = moduleFixture.createNestApplication();
    testModuleFixture = moduleFixture.get<TestModuleFixture>(TestModuleFixture);

    testService = moduleFixture.get<TypeOrmRepositoryAdapterFixture>(
      TypeOrmRepositoryAdapterFixture,
    );

    seedingSource = new SeedingSource({
      dataSource: app.get(getDataSourceToken()),
    });

    await seedingSource.initialize();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be loaded', async () => {
    expect(testModuleFixture).toBeInstanceOf(TestModuleFixture);
    expect(testService).toBeInstanceOf(TypeOrmRepositoryAdapterFixture);
  });

  describe(TypeOrmRepositoryAdapter.prototype['findOne'], () => {
    it('query exception', async () => {
      jest.spyOn(testService['repo'], 'findOne').mockImplementationOnce(() => {
        throw new Error();
      });

      await expect(testService['findOne']({})).rejects.toThrow(
        ModelQueryException,
      );
    });
  });
});

import { getDataSourceToken } from '@nestjs/typeorm';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SeedingSource } from '@concepta/typeorm-seeding';

import { ReferenceLookupException } from '../exceptions/reference-lookup.exception';

import { AppModuleFixture } from '../__fixtures__/app.module.fixture';
import { TestModuleFixture } from '../__fixtures__/test.module.fixture';
import { TestEntityFixture } from '../__fixtures__/test.entity.fixture';
import { TypeOrmRepositoryService } from './typeorm-repository.service';
import { TestTypeOrmRepositoryServiceFixture } from '../__fixtures__/services/test-typeorm-repository.service.fixture';

describe(TypeOrmRepositoryService, () => {
  let app: INestApplication;
  let testModuleFixture: TestModuleFixture;
  let testService: TypeOrmRepositoryService<TestEntityFixture>;
  let seedingSource: SeedingSource;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModuleFixture],
    }).compile();

    app = moduleFixture.createNestApplication();
    testModuleFixture = moduleFixture.get<TestModuleFixture>(TestModuleFixture);

    testService = moduleFixture.get<TestTypeOrmRepositoryServiceFixture>(
      TestTypeOrmRepositoryServiceFixture,
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
    expect(testService).toBeInstanceOf(TestTypeOrmRepositoryServiceFixture);
  });

  describe(TypeOrmRepositoryService.prototype['findOne'], () => {
    it('lookup exception', async () => {
      jest.spyOn(testService['repo'], 'findOne').mockImplementationOnce(() => {
        throw new Error();
      });

      await expect(testService['findOne']({})).rejects.toThrow(
        ReferenceLookupException,
      );
    });
  });
});

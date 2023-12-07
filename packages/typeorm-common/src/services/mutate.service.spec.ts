import { Test, TestingModule } from '@nestjs/testing';
import { SeedingSource } from '@concepta/typeorm-seeding';
import { getDataSourceToken } from '@nestjs/typeorm';
import { INestApplication } from '@nestjs/common';

import { MutateService } from './mutate.service';
import { ReferenceMutateException } from '../exceptions/reference-mutate.exception';
import { ReferenceValidationException } from '../exceptions/reference-validation.exception';
import { ReferenceIdNoMatchException } from '../exceptions/reference-id-no-match.exception';
import { ReferenceLookupException } from '../exceptions/reference-lookup.exception';

import { AppModuleFixture } from '../__fixtures__/app.module.fixture';
import { TestMutateServiceFixture } from '../__fixtures__/services/test-mutate.service.fixture';
import { TestModuleFixture } from '../__fixtures__/test.module.fixture';
import { TestEntityFixture } from '../__fixtures__/test.entity.fixture';
import { TestFactoryFixture } from '../__fixtures__/test.factory.fixture';

describe(MutateService, () => {
  const WRONG_UUID = '3bfd065e-0c30-11ed-861d-0242ac120002';
  let app: INestApplication;
  let testModuleFixture: TestModuleFixture;
  let testMutateService: TestMutateServiceFixture;
  let seedingSource: SeedingSource;
  let testFactory: TestFactoryFixture;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModuleFixture],
    }).compile();

    app = moduleFixture.createNestApplication();
    testModuleFixture = moduleFixture.get<TestModuleFixture>(TestModuleFixture);

    testMutateService = moduleFixture.get<TestMutateServiceFixture>(
      TestMutateServiceFixture,
    );

    seedingSource = new SeedingSource({
      dataSource: app.get(getDataSourceToken()),
    });

    await seedingSource.initialize();

    testFactory = new TestFactoryFixture({
      entity: TestEntityFixture,
      seedingSource,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be loaded', async () => {
    expect(testModuleFixture).toBeInstanceOf(TestModuleFixture);
  });

  describe(MutateService.prototype.create, () => {
    it('success', async () => {
      const savedData = await testMutateService.create({
        firstName: 'Bob',
      });

      expect(savedData).toBeInstanceOf(TestEntityFixture);
      expect(savedData.id.length).toBeGreaterThan(0);
      expect(savedData.version).toEqual(1);
    });

    it('exception', async () => {
      jest
        .spyOn(testMutateService['repo'], 'save')
        .mockImplementationOnce(() => {
          throw Error();
        });

      const t = async () => {
        return testMutateService.create({ firstName: 'Bob' });
      };

      await expect(t).rejects.toThrow(ReferenceMutateException);
    });

    it('invalid', async () => {
      const t = async () => {
        return testMutateService.create({ firstName: 'B' });
      };

      await expect(t).rejects.toThrow(ReferenceValidationException);
    });
  });

  describe(MutateService.prototype.update, () => {
    it('success', async () => {
      const testObject = await testFactory.create({ firstName: 'Bob' });

      expect(testObject.firstName).toBe('Bob');
      expect(testObject.version).toBe(1);

      const entity = await testMutateService.update({
        id: testObject.id,
        firstName: 'Bill',
      });

      expect(entity).toBeInstanceOf(TestEntityFixture);
      expect(entity.firstName).toBe('Bill');
      expect(entity.version).toBe(2);
    });

    it('not found', async () => {
      const t = async () => {
        return testMutateService.update({
          id: WRONG_UUID,
        });
      };

      await expect(t()).rejects.toThrow(ReferenceIdNoMatchException);
    });

    it('found but not valid', async () => {
      const testObject = await testFactory.create();
      const t = async () => {
        return testMutateService.update({
          id: testObject.id,
          firstName: 'A',
        });
      };

      await expect(t).rejects.toThrow(ReferenceValidationException);
    });

    it('found, valid, but exception on save', async () => {
      const testObject = await testFactory.create();

      jest
        .spyOn(testMutateService['repo'], 'save')
        .mockImplementationOnce(() => {
          throw new Error();
        });

      const t = async () => {
        return testMutateService.update({
          id: testObject.id,
        });
      };

      await expect(t).rejects.toThrow(ReferenceMutateException);
    });
  });

  describe(MutateService.prototype.replace, () => {
    it('success', async () => {
      const pastDate = new Date();
      pastDate.setMilliseconds(pastDate.getMilliseconds() - 100);
      const testObject = await testFactory.create({
        firstName: 'Bob',
        dateCreated: pastDate,
        dateUpdated: pastDate,
        dateDeleted: null,
        version: 5,
      });

      expect(testObject).toBeInstanceOf(TestEntityFixture);
      expect(testObject.firstName).toEqual('Bob');
      expect(testObject.version).toEqual(5);

      const entity = await testMutateService.replace({
        id: testObject.id,
        firstName: 'Bill',
      });

      expect(entity).toBeInstanceOf(TestEntityFixture);
      expect(entity.firstName).toEqual('Bill');
      expect(entity.dateCreated).toEqual(testObject.dateCreated);
      expect(entity.dateUpdated).not.toEqual(testObject.dateUpdated);
      expect(entity.dateDeleted).toEqual(null);
      expect(entity.version).toEqual(6);
    });

    it('not found', async () => {
      const t = async () => {
        return testMutateService.replace({
          id: WRONG_UUID,
          firstName: 'Bill',
        });
      };

      await expect(t).rejects.toThrow(ReferenceIdNoMatchException);
    });

    it('found but not valid', async () => {
      const testObject = await testFactory.create();

      const t = async () => {
        return testMutateService.replace({
          id: testObject.id,
          firstName: 'B',
        });
      };

      await expect(t).rejects.toThrow(ReferenceValidationException);
    });

    it('found, valid, but exception on save', async () => {
      const testObject = await testFactory.create();

      jest
        .spyOn(testMutateService['repo'], 'save')
        .mockImplementationOnce(() => {
          throw new Error();
        });

      const t = async () => {
        return testMutateService.replace({
          id: testObject.id,
          firstName: 'Bill',
        });
      };

      await expect(t).rejects.toThrow(ReferenceMutateException);
    });
  });

  describe(MutateService.prototype.remove, () => {
    it('success', async () => {
      const testObject = await testFactory.create();

      const remove = jest.spyOn(testMutateService['repo'], 'remove');

      await testMutateService.remove({ id: testObject.id });

      expect(remove).toBeCalledTimes(1);

      const t = async () => {
        return testMutateService['findById'](testObject.id);
      };

      await expect(t).rejects.toThrow(ReferenceIdNoMatchException);
    });

    it('id does not match', async () => {
      const t = async () => {
        return testMutateService.remove({
          id: WRONG_UUID,
        });
      };

      await expect(t).rejects.toThrow(ReferenceIdNoMatchException);
    });

    it('exception', async () => {
      const testObject = await testFactory.create();

      const t = async () => {
        return testMutateService.remove(testObject);
      };

      jest
        .spyOn(testMutateService['repo'], 'remove')
        .mockImplementationOnce(() => {
          throw new Error();
        });

      await expect(t).rejects.toThrow(ReferenceMutateException);
    });
  });

  describe(MutateService.prototype['findById'], () => {
    it('exception', async () => {
      const testObject = await testFactory.create();

      const t = async () => {
        return testMutateService['findById'](testObject.id);
      };

      jest
        .spyOn(testMutateService['repo'], 'findOne')
        .mockImplementationOnce(() => {
          throw new Error();
        });

      await expect(t).rejects.toThrow(ReferenceLookupException);
    });
  });
});

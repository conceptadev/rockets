import { Test, TestingModule } from '@nestjs/testing';
import { SeedingSource } from '@concepta/typeorm-seeding';
import { getDataSourceToken } from '@nestjs/typeorm';
import { INestApplication } from '@nestjs/common';
import { ReferenceMutateException } from '../exceptions/reference-mutate.exception';
import { ReferenceValidationException } from '../exceptions/reference-validation.exception';
import { ReferenceIdNoMatchException } from '../exceptions/reference-id-no-match.exception';
import { ReferenceLookupException } from '../exceptions/reference-lookup.exception';

import { AppModuleFixture } from '../__fixtures__/app.module.fixture';
import { TestMutateServiceFixture } from '../__fixtures__/services/test-mutate.service.fixture';
import { TestModuleFixture } from '../__fixtures__/test.module.fixture';
import { TestEntityFixture } from '../__fixtures__/test.entity.fixture';
import { TestFactoryFixture } from '../__fixtures__/test.factory.fixture';

describe('MutateService', () => {
  const WRONG_UUID = '3bfd065e-0c30-11ed-861d-0242ac120002';
  let app: INestApplication;
  let auditModuleCustomFixture: TestModuleFixture;
  let auditMutateCustomService: TestMutateServiceFixture;
  let seedingSource: SeedingSource;
  let auditFactory: TestFactoryFixture;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModuleFixture],
    }).compile();

    app = moduleFixture.createNestApplication();
    auditModuleCustomFixture =
      moduleFixture.get<TestModuleFixture>(TestModuleFixture);

    auditMutateCustomService = moduleFixture.get<TestMutateServiceFixture>(
      TestMutateServiceFixture,
    );

    seedingSource = new SeedingSource({
      dataSource: app.get(getDataSourceToken()),
    });

    auditFactory = new TestFactoryFixture({
      entity: TestEntityFixture,
      seedingSource,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be loaded', async () => {
    expect(auditModuleCustomFixture).toBeInstanceOf(TestModuleFixture);
  });

  describe('MutateService Create', () => {
    it('MutateService.create valid success', async () => {
      const savedData = await auditMutateCustomService.create({
        firstName: 'Bob',
      });

      expect(savedData.id.length).toBeGreaterThan(0);
      expect(savedData.audit.version).toEqual(1);
    });

    it('MutateService.create valid Exception', async () => {
      jest
        .spyOn(auditMutateCustomService['repo'], 'save')
        .mockImplementationOnce(() => {
          throw Error();
        });

      const t = async () => {
        return auditMutateCustomService.create({ firstName: 'Bob' });
      };

      expect(t).rejects.toThrow(ReferenceMutateException);
    });

    it('MutateService.create Not Valid', async () => {
      const t = async () => {
        return auditMutateCustomService.create({ firstName: 'B' });
      };

      expect(t).rejects.toThrow(ReferenceValidationException);
    });
  });

  describe('MutateService.update', () => {
    it('MutateService.update valid success', async () => {
      const testObject = await auditFactory.create({ firstName: 'Bob' });

      expect(testObject.firstName).toBe('Bob');
      expect(testObject.audit.version).toBe(1);

      const data = await auditMutateCustomService.update({
        id: testObject.id,
        firstName: 'Bill',
      });

      expect(data.firstName).toBe('Bill');
      expect(data.audit.version).toBe(2);
    });

    it('MutateService.update not found', async () => {
      const t = async () => {
        return auditMutateCustomService.update({
          id: WRONG_UUID,
        });
      };

      expect(t()).rejects.toThrow(ReferenceIdNoMatchException);
    });

    it('MutateService.update found but not valid', async () => {
      const testObject = await auditFactory.create();
      const t = async () => {
        return auditMutateCustomService.update({
          id: testObject.id,
          firstName: 'A',
        });
      };

      expect(t).rejects.toThrow(ReferenceValidationException);
    });

    it('MutateService.update found, valid, but exception on save', async () => {
      const testObject = await auditFactory.create();

      jest
        .spyOn(auditMutateCustomService['repo'], 'save')
        .mockImplementationOnce(() => {
          throw new Error();
        });

      const t = async () => {
        return auditMutateCustomService.update({
          id: testObject.id,
        });
      };

      expect(t).rejects.toThrow(ReferenceMutateException);
    });
  });

  describe('MutateService.replace', () => {
    it('MutateService.replace success', async () => {
      const pastDate = new Date();
      pastDate.setMilliseconds(pastDate.getMilliseconds() - 100);
      const testObject = await auditFactory.create({
        firstName: 'Bob',
        audit: {
          dateCreated: pastDate,
          dateUpdated: pastDate,
          dateDeleted: null,
          version: 5,
        },
      });

      expect(testObject.firstName).toEqual('Bob');
      expect(testObject.audit.version).toEqual(5);

      const remove = jest.spyOn(auditMutateCustomService['repo'], 'remove');

      const data = await auditMutateCustomService.replace({
        id: testObject.id,
        firstName: 'Bill',
      });

      expect(remove).toBeCalledTimes(1);
      expect(data.firstName).toEqual('Bill');
      expect(data.audit.dateCreated).not.toEqual(testObject.audit.dateCreated);
      expect(data.audit.dateUpdated).not.toEqual(testObject.audit.dateUpdated);
      expect(data.audit.dateDeleted).toEqual(null);
      expect(data.audit.version).toEqual(1);
    });

    it('MutateService.replace not found', async () => {
      const t = async () => {
        return auditMutateCustomService.replace({
          id: WRONG_UUID,
          firstName: 'Bill',
        });
      };

      expect(t).rejects.toThrow(ReferenceIdNoMatchException);
    });

    it('MutateService.replace found but not valid', async () => {
      const testObject = await auditFactory.create();

      const t = async () => {
        return auditMutateCustomService.replace({
          id: testObject.id,
          firstName: 'B',
        });
      };

      expect(t).rejects.toThrow(ReferenceValidationException);
    });

    it('MutateService.replace found, valid, but exception on save', async () => {
      const testObject = await auditFactory.create();

      jest
        .spyOn(auditMutateCustomService['repo'], 'save')
        .mockImplementationOnce(() => {
          throw new Error();
        });

      const t = async () => {
        return auditMutateCustomService.replace({
          id: testObject.id,
          firstName: 'Bill',
        });
      };

      expect(t).rejects.toThrow(ReferenceMutateException);
    });
  });

  describe('MutateService.remove', () => {
    it('MutateService.remove success', async () => {
      const testObject = await auditFactory.create();

      const remove = jest.spyOn(auditMutateCustomService['repo'], 'remove');

      await auditMutateCustomService.remove({ id: testObject.id });

      expect(remove).toBeCalledTimes(1);

      const t = async () => {
        return auditMutateCustomService['findById'](testObject.id);
      };

      expect(t).rejects.toThrow(ReferenceIdNoMatchException);
    });

    it('MutateService.remove id not match', async () => {
      const t = async () => {
        return auditMutateCustomService.remove({
          id: WRONG_UUID,
        });
      };

      expect(t).rejects.toThrow(ReferenceIdNoMatchException);
    });

    it('MutateService.remove error on remove', async () => {
      const testObject = await auditFactory.create();

      const t = async () => {
        return auditMutateCustomService.remove(testObject);
      };

      jest
        .spyOn(auditMutateCustomService['repo'], 'remove')
        .mockImplementationOnce(() => {
          throw new Error();
        });

      expect(t).rejects.toThrow(ReferenceMutateException);
    });
  });

  describe('MutateService.findById Exception', () => {
    it('MutateService.findById throw exception', async () => {
      const testObject = await auditFactory.create();

      const t = async () => {
        return auditMutateCustomService['findById'](testObject.id);
      };

      jest
        .spyOn(auditMutateCustomService['repo'], 'findOne')
        .mockImplementationOnce(() => {
          throw new Error();
        });

      expect(t).rejects.toThrow(ReferenceLookupException);
    });
  });
});

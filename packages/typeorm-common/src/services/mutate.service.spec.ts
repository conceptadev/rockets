//import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { SeedingSource } from '@concepta/typeorm-seeding';
import { getDataSourceToken } from '@nestjs/typeorm';
import { AppModuleCustomFixture } from '../__fixtures__/app.module.custom.fixture';
import { AuditMutateCustomService } from '../__fixtures__/services/audit-mutate.custom.service';
import { AuditModuleCustomFixture } from '../__fixtures__/audit.module.custom.fixture';
import { INestApplication } from '@nestjs/common';
import { AuditFactory } from '../audit.factory';
import { AuditEntityFixture } from '../__fixtures__/audit.entity.fixture';
import { AuditEntityCreatableFixtureInterface } from '../__fixtures__/interface/audit.entity.creatable.fixture.interface';
import { ReferenceMutateException } from '../exceptions/reference-mutate.exception';
import { ReferenceValidationException } from '../exceptions/reference-validation.exception';
import { ReferenceIdNoMatchException } from '../exceptions/reference-id-no-match.exception';
import { ReferenceLookupException } from '../exceptions/reference-lookup.exception';

describe('MutateService', () => {
  const WRONG_UUID = '3bfd065e-0c30-11ed-861d-0242ac120002';
  let app: INestApplication;
  let auditModuleCustomFixture: AuditModuleCustomFixture;
  let auditMutateCustomService: AuditMutateCustomService;
  let seedingSource: SeedingSource;
  let testAudit: AuditEntityFixture;
  let newAudit: AuditEntityCreatableFixtureInterface;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModuleCustomFixture],
    }).compile();

    app = moduleFixture.createNestApplication();
    auditModuleCustomFixture = moduleFixture.get<AuditModuleCustomFixture>(
      AuditModuleCustomFixture,
    );

    auditMutateCustomService = moduleFixture.get<AuditMutateCustomService>(
      AuditMutateCustomService,
    );

    seedingSource = new SeedingSource({
      dataSource: app.get(getDataSourceToken()),
    });

    const userFactory = new AuditFactory({
      entity: AuditEntityFixture,
      seedingSource,
    });

    testAudit = await userFactory.create();

    const now = new Date();
    newAudit = {
      dateCreated: now,
      dateDeleted: now,
      dateUpdated: now,
      version: 1,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be loaded', async () => {
    expect(auditModuleCustomFixture).toBeInstanceOf(AuditModuleCustomFixture);
  });

  describe('MutateService Create', () => {
    it('MutateService.create valid success', async () => {
      const savedData = await auditMutateCustomService.create(newAudit);
      expect(savedData.id).toBeDefined();
      expect(savedData.version).toBe(newAudit.version);
    });

    it('MutateService.create valid Exception', async () => {
      jest
        .spyOn(auditMutateCustomService['repo'], 'save')
        .mockImplementationOnce(() => {
          throw Error();
        });

      expect(auditMutateCustomService.create(newAudit)).rejects.toThrow(
        ReferenceMutateException,
      );
    });

    it('MutateService.create Not Valid', async () => {
      newAudit.version = 0;
      expect(auditMutateCustomService.create(newAudit)).rejects.toThrow(
        ReferenceValidationException,
      );
    });
  });

  describe('MutateService.update', () => {
    it('MutateService.update valid success', async () => {
      expect(testAudit.version).toBe(99);
      const data = await auditMutateCustomService.update({
        ...testAudit,
        version: 2,
      });
      expect(data.version).toBe(2);
    });

    it('MutateService.update not found', async () => {
      const t = async () => {
        return auditMutateCustomService.update({
          ...testAudit,
          id: WRONG_UUID,
        });
      };
      expect(t()).rejects.toThrow(ReferenceIdNoMatchException);
    });

    it('MutateService.update found but not valid', async () => {
      const t = async () => {
        return auditMutateCustomService.update({
          ...testAudit,
          version: 0,
        });
      };
      expect(t).rejects.toThrow(ReferenceValidationException);
    });

    it('MutateService.update found, valid, but exception on save', async () => {
      jest
        .spyOn(auditMutateCustomService['repo'], 'save')
        .mockImplementationOnce(() => {
          throw new Error();
        });
      const t = async () => {
        return auditMutateCustomService.update({
          ...testAudit,
          version: 2,
        });
      };
      expect(t).rejects.toThrow(ReferenceMutateException);
    });
  });

  describe('MutateService.replace', () => {
    it('MutateService.replace success', async () => {
      expect(testAudit.version).toBe(99);
      const remove = jest.spyOn(auditMutateCustomService['repo'], 'remove');
      const data = await auditMutateCustomService.replace({
        ...testAudit,
        version: 2,
      });
      expect(remove).toBeCalledTimes(1);
      expect(data.version).toBe(2);
    });

    it('MutateService.replace not found', async () => {
      const t = async () => {
        return auditMutateCustomService.replace({
          ...testAudit,
          id: WRONG_UUID,
        });
      };
      expect(t).rejects.toThrow(ReferenceIdNoMatchException);
    });

    it('MutateService.replace found but not valid', async () => {
      const t = async () => {
        await auditMutateCustomService.replace({
          ...testAudit,
          version: 0,
        });
      };
      expect(t).rejects.toThrow(ReferenceValidationException);
    });

    it('MutateService.replace found, valid, but exception on save', async () => {
      jest
        .spyOn(auditMutateCustomService['repo'], 'save')
        .mockImplementationOnce(() => {
          throw new Error();
        });
      const t = async () => {
        return auditMutateCustomService.replace({
          ...testAudit,
          version: 2,
        });
      };
      expect(t).rejects.toThrow(ReferenceMutateException);
    });
  });

  describe('MutateService.remove', () => {
    it('MutateService.remove success', async () => {
      const remove = jest.spyOn(auditMutateCustomService['repo'], 'remove');
      await auditMutateCustomService.remove(testAudit);

      expect(remove).toBeCalledTimes(1);

      const t = async () => {
        await auditMutateCustomService['findById'](testAudit.id);
      };
      expect(t).rejects.toThrow(ReferenceIdNoMatchException);
    });

    it('MutateService.remove id not match', async () => {
      const t = async () => {
        await auditMutateCustomService.remove({
          ...testAudit,
          id: WRONG_UUID,
        });
      };
      expect(t).rejects.toThrow(ReferenceIdNoMatchException);
    });

    it('MutateService.remove error on remove', async () => {
      const t = async () => {
        await auditMutateCustomService.remove(testAudit);
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
      const t = async () => {
        await auditMutateCustomService['findById'](testAudit.id);
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

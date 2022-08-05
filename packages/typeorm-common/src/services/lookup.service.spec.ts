//import { Repository } from 'typeorm';
import { BadRequestException, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SeedingSource } from '@concepta/typeorm-seeding';
import { getDataSourceToken } from '@nestjs/typeorm';
import { AppModuleCustomFixture } from '../__fixtures__/app.module.custom.fixture';

import { AuditModuleCustomFixture } from '../__fixtures__/audit.module.custom.fixture';
import { AuditFactory } from '../audit.factory';
import { AuditEntityFixture } from '../__fixtures__/audit.entity.fixture';
import { ReferenceLookupException } from '../exceptions/reference-lookup.exception';
import { AuditLookupCustomService } from '../__fixtures__/services/audit-lookup.custom.service';

describe('LookupService', () => {
  const RANDOM_UUID = '3bfd065e-0c30-11ed-861d-0242ac120002';
  let app: INestApplication;
  let auditModuleCustomFixture: AuditModuleCustomFixture;
  let auditLookupCustomService: AuditLookupCustomService;
  let seedingSource: SeedingSource;
  let testAudit: AuditEntityFixture;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModuleCustomFixture],
    }).compile();

    app = moduleFixture.createNestApplication();
    auditModuleCustomFixture = moduleFixture.get<AuditModuleCustomFixture>(
      AuditModuleCustomFixture,
    );

    auditLookupCustomService = moduleFixture.get<AuditLookupCustomService>(
      AuditLookupCustomService,
    );

    seedingSource = new SeedingSource({
      dataSource: app.get(getDataSourceToken()),
    });

    const userFactory = new AuditFactory({
      entity: AuditEntityFixture,
      seedingSource,
    });

    testAudit = await userFactory.create();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('lookupService', () => {
    it('should be loaded', async () => {
      expect(auditModuleCustomFixture).toBeInstanceOf(AuditModuleCustomFixture);
      expect(auditLookupCustomService).toBeInstanceOf(AuditLookupCustomService);
    });

    describe('lookupService.byId', () => {
      it('lookupService.byId Success', async () => {
        const result = await auditLookupCustomService.byId(testAudit?.id);
        expect(result?.version).toBe(testAudit.version);
      });

      it('lookupService.byId wrong id', async () => {
        const result = await auditLookupCustomService.byId(RANDOM_UUID);
        expect(result?.version).toBe(undefined);
      });
    });

    describe('lookupService.findOne', () => {
      it('lookupService.findOne Exception', async () => {
        jest
          .spyOn(auditLookupCustomService['repo'], 'findOne')
          .mockImplementationOnce(() => {
            throw new Error();
          });

        expect(auditLookupCustomService['findOne']({})).rejects.toThrow(
          ReferenceLookupException,
        );
      });

      it('lookupService.findOne Exception', async () => {
        jest
          .spyOn(auditLookupCustomService['repo'], 'findOne')
          .mockImplementationOnce(() => {
            throw new BadRequestException();
          });

        expect(auditLookupCustomService['findOne']({})).rejects.toThrow(
          ReferenceLookupException,
        );
      });
    });

    describe('lookupService.find', () => {
      it('lookupService.find', async () => {
        const result = await auditLookupCustomService['find']({
          where: { id: testAudit.id },
        });
        expect(result ? result[0]?.version : null).toBe(testAudit.version);
      });

      it('lookupService.find wrong id', async () => {
        const result = await auditLookupCustomService['find']({
          where: { id: RANDOM_UUID },
        });
        expect(result?.length).toBe(0);
      });

      it('lookupService.find Error', async () => {
        jest
          .spyOn(auditLookupCustomService['repo'], 'find')
          .mockImplementationOnce(() => {
            throw new Error();
          });

        expect(auditLookupCustomService['find']({})).rejects.toThrow(
          ReferenceLookupException,
        );
      });

      it('lookupService.find Exception', async () => {
        jest
          .spyOn(auditLookupCustomService['repo'], 'find')
          .mockImplementationOnce(() => {
            throw new BadRequestException();
          });

        expect(auditLookupCustomService['find']({})).rejects.toThrow(
          ReferenceLookupException,
        );
      });
    });
  });
});

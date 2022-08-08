import { getDataSourceToken } from '@nestjs/typeorm';
import { BadRequestException, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SeedingSource } from '@concepta/typeorm-seeding';
import { ReferenceLookupException } from '../exceptions/reference-lookup.exception';

import { AppModuleFixture } from '../__fixtures__/app.module.fixture';
import { TestModuleFixture } from '../__fixtures__/test.module.fixture';
import { TestEntityFixture } from '../__fixtures__/test.entity.fixture';
import { TestLookupServiceFixture } from '../__fixtures__/services/test-lookup.service.fixture';
import { TestFactoryFixture } from '../__fixtures__/test.factory.fixture';

describe('LookupService', () => {
  const RANDOM_UUID = '3bfd065e-0c30-11ed-861d-0242ac120002';
  let app: INestApplication;
  let auditModuleCustomFixture: TestModuleFixture;
  let auditLookupCustomService: TestLookupServiceFixture;
  let seedingSource: SeedingSource;
  let testObject: TestEntityFixture;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModuleFixture],
    }).compile();

    app = moduleFixture.createNestApplication();
    auditModuleCustomFixture =
      moduleFixture.get<TestModuleFixture>(TestModuleFixture);

    auditLookupCustomService = moduleFixture.get<TestLookupServiceFixture>(
      TestLookupServiceFixture,
    );

    seedingSource = new SeedingSource({
      dataSource: app.get(getDataSourceToken()),
    });

    const userFactory = new TestFactoryFixture({
      entity: TestEntityFixture,
      seedingSource,
    });

    testObject = await userFactory.create();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('lookupService', () => {
    it('should be loaded', async () => {
      expect(auditModuleCustomFixture).toBeInstanceOf(TestModuleFixture);
      expect(auditLookupCustomService).toBeInstanceOf(TestLookupServiceFixture);
    });

    describe('lookupService.byId', () => {
      it('lookupService.byId Success', async () => {
        const result = await auditLookupCustomService.byId(testObject?.id);
        expect(result?.audit.version).toBe(testObject.audit.version);
      });

      it('lookupService.byId wrong id', async () => {
        const result = await auditLookupCustomService.byId(RANDOM_UUID);
        expect(result?.audit.version).toBe(undefined);
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
          where: { id: testObject.id },
        });
        expect(result ? result[0]?.audit.version : null).toBe(
          testObject.audit.version,
        );
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

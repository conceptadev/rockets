import { Repository } from 'typeorm';
import { DynamicModule, ModuleMetadata } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ReportStatusEnum } from '@concepta/ts-common';
import { FileModule } from '@concepta/nestjs-file';
import {
  getDynamicRepositoryToken,
  getEntityRepositoryToken,
  TypeOrmExtModule,
} from '@concepta/nestjs-typeorm-ext';

import { ReportService } from './services/report.service';

import { REPORT_MODULE_REPORT_ENTITY_KEY } from './report.constants';

import { ReportEntityInterface } from './interfaces/report-entity.interface';

import { AwsStorageService } from './__fixtures__/aws-storage.service';
import {
  REPORT_KEY_FIXTURE,
  REPORT_NAME_FIXTURE,
  REPORT_SHORT_DELAY_KEY_FIXTURE,
} from './__fixtures__/constants.fixture';
import { FileEntityFixture } from './__fixtures__/file/file-entity.fixture';
import { MyReportGeneratorShortDelayService } from './__fixtures__/my-report-generator-short-delay.service';
import { MyReportGeneratorService } from './__fixtures__/my-report-generator.service';
import { ReportGeneratorModuleFixture } from './__fixtures__/report-generator.module.fixture';
import { ReportEntityFixture } from './__fixtures__/report/report-entity.fixture';
import { UserEntityFixture } from './__fixtures__/user/entities/user.entity.fixture';
import { ReportModule } from './report.module';
import { delay } from './utils/delay.util';

describe(ReportModule, () => {
  let testModule: TestingModule;
  let reportModule: ReportModule;
  let reportService: ReportService;
  let reportEntityRepo: Repository<ReportEntityInterface>;
  let reportDynamicRepo: Repository<ReportEntityInterface>;

  describe(ReportModule.forRootAsync, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          ReportModule.forRootAsync({
            inject: [
              MyReportGeneratorService,
              MyReportGeneratorShortDelayService,
            ],
            useFactory: (
              myGeneratorService: MyReportGeneratorService,
              myGeneratorWithDelay: MyReportGeneratorService,
            ) => ({
              reportGeneratorServices: [
                myGeneratorService,
                myGeneratorWithDelay,
              ],
            }),
            entities: {
              report: {
                entity: ReportEntityFixture,
              },
            },
          }),
        ]),
      ).compile();
      commonVars();
    });

    afterAll(async () => {
      await delay(1000);
      testModule.close();
    });

    it('module should be loaded', async () => {
      commonTests();
    });

    /**
     * generate report with success
     */
    const generateReport = async () => {
      const result = await reportService.generate({
        name: REPORT_NAME_FIXTURE,
        serviceKey: REPORT_KEY_FIXTURE,
      });
      return result;
    };

    /**
     * generate report that will throw timeout exception
     */
    const generateReportWithTimeout = async () => {
      const result = await reportService.generate({
        name: REPORT_NAME_FIXTURE,
        serviceKey: REPORT_SHORT_DELAY_KEY_FIXTURE,
      });
      return result;
    };

    const fetchReport = async (id: string) => {
      const report = await reportService.fetch({
        id: id,
      });
      return report;
    };

    it('generate with success ', async () => {
      const result = await generateReport();
      expect(result.serviceKey).toBe(REPORT_KEY_FIXTURE);
      expect(result.name).toBe(REPORT_NAME_FIXTURE);

      // add a delay to ensure generator will complete
      await delay(2000);
      const report = await fetchReport(result.id);

      expect(report.id).toBe(result.id);
      expect(report.status).toBe(ReportStatusEnum.Complete);
    });

    it('generate with processing ', async () => {
      const result = await generateReport();
      expect(result.serviceKey).toBe(REPORT_KEY_FIXTURE);
      expect(result.name).toBe(REPORT_NAME_FIXTURE);

      // since there is no delay status will still be processing
      const report = await fetchReport(result.id);
      expect(report.id).toBe(result.id);
      expect(report.status).toBe(ReportStatusEnum.Processing);
    });
    it('generator with timeout', async () => {
      const result = await generateReportWithTimeout();
      expect(result.serviceKey).toBe(REPORT_SHORT_DELAY_KEY_FIXTURE);
      expect(result.name).toBe(REPORT_NAME_FIXTURE);

      // add a delay to get wait for timeout error
      await delay(200);

      const report = await fetchReport(result.id);
      expect(report.id).toBe(result.id);
      expect(report.status).toBe(ReportStatusEnum.Error);
    });
  });

  describe(ReportModule.registerAsync, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          ReportModule.registerAsync({
            inject: [MyReportGeneratorService],
            useFactory: (awsStorageService: MyReportGeneratorService) => ({
              reportGeneratorServices: [awsStorageService],
            }),
            entities: {
              report: {
                entity: ReportEntityFixture,
              },
            },
          }),
        ]),
      ).compile();
    });
    it('module should be loaded', async () => {
      commonVars();
      commonTests();
    });
  });

  const commonVars = () => {
    reportModule = testModule.get(ReportModule);
    reportService = testModule.get(ReportService);
    reportEntityRepo = testModule.get<Repository<ReportEntityFixture>>(
      getEntityRepositoryToken(REPORT_MODULE_REPORT_ENTITY_KEY),
    );
    reportDynamicRepo = testModule.get(
      getDynamicRepositoryToken(REPORT_MODULE_REPORT_ENTITY_KEY),
    );
  };

  const commonTests = async () => {
    expect(reportModule).toBeInstanceOf(ReportModule);
    expect(reportService).toBeInstanceOf(ReportService);
    expect(reportEntityRepo).toBeInstanceOf(Repository);
    expect(reportDynamicRepo).toBeInstanceOf(Repository);

    const result = await reportService.generate({
      name: REPORT_NAME_FIXTURE,
      serviceKey: REPORT_KEY_FIXTURE,
    });
    expect(result.serviceKey).toBe(REPORT_KEY_FIXTURE);
    expect(result.name).toBe(REPORT_NAME_FIXTURE);

    const report = await reportService.fetch({
      id: result.id,
    });
    expect(report.id).toBe(report.id);
    expect(report.status).toBe(ReportStatusEnum.Processing);
  };
});

function testModuleFactory(
  extraImports: DynamicModule['imports'] = [],
): ModuleMetadata {
  return {
    imports: [
      TypeOrmExtModule.forRoot({
        type: 'sqlite',
        database: ':memory:',
        synchronize: true,
        entities: [UserEntityFixture, FileEntityFixture, ReportEntityFixture],
      }),
      FileModule.forRoot({
        entities: {
          file: {
            entity: FileEntityFixture,
          },
        },
        storageServices: [new AwsStorageService()],
      }),
      ReportGeneratorModuleFixture,
      ...extraImports,
    ],
  };
}

import { ReportCreatableInterface, ReportInterface, ReportStatusEnum } from '@concepta/ts-common';
import { mapNonErrorToException } from '@concepta/ts-core';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';

import { ReportCreateException } from '../exceptions/report-create.exception';
import { ReportDuplicateEntryException } from '../exceptions/report-duplicated.exception';
import { ReportIdMissingException } from '../exceptions/report-id-missing.exception';
import { ReportQueryException } from '../exceptions/report-query.exception';
import { ReportEntityInterface } from '../interfaces/report-entity.interface';
import { ReportGeneratorResultInterface } from '../interfaces/report-generator-result.interface';
import { ReportLookupServiceInterface } from '../interfaces/report-lookup-service.interface';
import { ReportMutateServiceInterface } from '../interfaces/report-mutate-service.interface';
import { ReportServiceInterface } from '../interfaces/report-service.interface';
import { REPORT_STRATEGY_SERVICE_KEY } from '../report.constants';
import { ReportLookupService } from './report-lookup.service';
import { ReportMutateService } from './report-mutate.service';
import { ReportStrategyService } from './report-strategy.service';

/**
 * Service responsible for managing report operations.
 */
@Injectable()
export class ReportService implements ReportServiceInterface {
  constructor(
    @Inject(REPORT_STRATEGY_SERVICE_KEY)
    private reportStrategyService: ReportStrategyService,
    @Inject(ReportMutateService)
    private reportMutateService: ReportMutateServiceInterface,
    @Inject(ReportLookupService)
    private reportLookupService: ReportLookupServiceInterface,
  ) {}

  async generate(report: ReportCreatableInterface): Promise<ReportInterface> {
    await this.checkExistingReport(report);
    try {
      const reportDb = await this.createAndSaveReport(report);

      // trigger report generation
      this.generateAndProcessReport(reportDb);

      return reportDb;
    } catch (originalError) {
      throw new ReportCreateException({ originalError });
    }
  }

  async fetch(report: Pick<ReportInterface, 'id'>): Promise<ReportInterface> {
    if (!report.id) {
      throw new ReportIdMissingException();
    }

    const dbReport = await this.reportLookupService.getWithFile(report);

    if (!dbReport) {
      throw new ReportQueryException({
        message: 'Report with id %s not found',
        messageParams: [report.id],
        httpStatus: HttpStatus.NOT_FOUND,
      });
    }

    return this.addDownloadUrl(dbReport);
  }

  async done(report: ReportGeneratorResultInterface): Promise<void> {
    if (!report.id) {
      throw new ReportIdMissingException();
    }

    this.reportMutateService.update(report);
  }

  protected async generateAndProcessReport(
    reportDb: ReportEntityInterface,
  ): Promise<void> {
    try {
      const result = await this.reportStrategyService.generate(reportDb);
      await this.done(result);
    } catch (err) {
      const finalError = mapNonErrorToException(err);
      await this.done({
        id: reportDb.id,
        status: ReportStatusEnum.Error,
        errorMessage: finalError.message,
      });
    }
  }

  protected async createAndSaveReport(
    report: ReportCreatableInterface,
  ): Promise<ReportEntityInterface> {
    return await this.reportMutateService.create(report);
  }

  protected async checkExistingReport(report: ReportCreatableInterface): Promise<void> {
    const existingReport = await this.reportLookupService.getUniqueReport(
      report,
    );

    if (existingReport) {
      throw new ReportDuplicateEntryException(report.serviceKey, report.name);
    }
  }

  protected async addDownloadUrl(
    report: ReportEntityInterface,
  ): Promise<ReportEntityInterface> {
    if (report.file?.id) {
      try {
        report.downloadUrl = await this.reportStrategyService.getDownloadUrl(
          report,
        );
      } catch (err) {
        report.downloadUrl = '';
      }
    }
    return report;
  }
}

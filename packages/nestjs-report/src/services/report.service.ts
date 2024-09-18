import { Repository } from 'typeorm';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { mapNonErrorToException } from '@concepta/ts-core';
import { ReportInterface, ReportStatusEnum } from '@concepta/ts-common';
import { BaseService } from '@concepta/typeorm-common';
import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';

import {
  REPORT_MODULE_REPORT_ENTITY_KEY,
  REPORT_STRATEGY_SERVICE_KEY,
} from '../report.constants';
import { ReportEntityInterface } from '../interfaces/report-entity.interface';
import { ReportServiceInterface } from '../interfaces/report-service.interface';
import { ReportQueryException } from '../exceptions/report-query.exception';
import { ReportCreateDto } from '../dto/report-create.dto';
import { ReportStrategyService } from './report-strategy.service';
import { ReportCreateException } from '../exceptions/report-create.exception';
import { ReportIdMissingException } from '../exceptions/report-id-missing.exception';
import { ReportDuplicateEntryException } from '../exceptions/report-duplicated.exception';
import { ReportGeneratorResultInterface } from '../interfaces/report-generator-result.interface';
import { ReportMutateService } from './report-mutate.service';
import { ReportMutateServiceInterface } from '../interfaces/report-mutate-service.interface';
import { ReportLookupService } from './report-lookup.service';
import { ReportLookupServiceInterface } from '../interfaces/report-lookup-service.interface';

/**
 * Service responsible for managing report operations.
 */
@Injectable()
export class ReportService implements ReportServiceInterface
{
  constructor(
    @Inject(REPORT_STRATEGY_SERVICE_KEY)
    private reportStrategyService: ReportStrategyService,
    @Inject(ReportMutateService)
    private reportMutateService: ReportMutateServiceInterface,
    @Inject(ReportLookupService)
    private reportLookupService: ReportLookupServiceInterface,
  ) {}

  async generate(report: ReportCreateDto): Promise<ReportInterface> {
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
    report: ReportCreateDto,
  ): Promise<ReportEntityInterface> {
    return await this.reportMutateService.create(report);
  }

  protected async checkExistingReport(report: ReportCreateDto): Promise<void> {
    const existingReport = await this.reportLookupService.getUniqueReport(report);

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

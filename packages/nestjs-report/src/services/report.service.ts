import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';
import { BaseService } from '@concepta/typeorm-common';
import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { ReportStatusEnum } from '@concepta/ts-common';

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
import { mapNonErrorToException } from '@concepta/ts-core';

/**
 * Service responsible for managing report operations.
 */
@Injectable()
export class ReportService
  extends BaseService<ReportEntityInterface>
  implements ReportServiceInterface
{
  constructor(
    @InjectDynamicRepository(REPORT_MODULE_REPORT_ENTITY_KEY)
    private reportRepo: Repository<ReportEntityInterface>,
    @Inject(REPORT_STRATEGY_SERVICE_KEY)
    private reportStrategyService: ReportStrategyService,
  ) {
    super(reportRepo);
  }

  async generate(report: ReportCreateDto): Promise<ReportEntityInterface> {
    await this.checkExistingReport(report);
    try {
      const reportDb = await this.createAndSaveReport(report);

      // trigger report generation
      this.generateAndProcessReport(reportDb);

      return reportDb;
    } catch (err) {
      throw new ReportCreateException(this.metadata.targetName, err);
    }
  }

  async fetch(
    report: Pick<ReportEntityInterface, 'id'>,
  ): Promise<ReportEntityInterface> {
    if (!report.id) throw new ReportIdMissingException();
    const dbReport = await this.reportRepo.findOne({
      where: {
        id: report.id,
      },
      relations: ['file'],
    });
    if (!dbReport) throw new ReportQueryException();
    return this.addDownloadUrl(dbReport);
  }

  async done(report: ReportGeneratorResultInterface): Promise<void> {
    if (!report.id) throw new ReportIdMissingException();

    const updatedReport = await this.reportRepo.findOne({
      where: { id: report.id },
    });

    if (!updatedReport) throw new ReportQueryException();

    updatedReport.status = report.status;
    updatedReport.errorMessage = report.errorMessage || null;
    updatedReport.file = report.file;

    await this.reportRepo.save(updatedReport);
  }

  private async generateAndProcessReport(
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

  private async createAndSaveReport(
    report: ReportCreateDto,
  ): Promise<ReportEntityInterface> {
    const newReport = this.reportRepo.create({
      ...report,
      status: ReportStatusEnum.Processing,
    });
    newReport.status = ReportStatusEnum.Processing;
    return await this.reportRepo.save(newReport);
  }

  private async checkExistingReport(report: ReportCreateDto): Promise<void> {
    const existingReport = await this.reportRepo.findOne({
      where: {
        serviceKey: report.serviceKey,
        name: report.name,
      },
    });

    if (existingReport) {
      throw new ReportDuplicateEntryException(report.serviceKey, report.name);
    }
  }

  private async addDownloadUrl(
    report: ReportEntityInterface,
  ): Promise<ReportEntityInterface> {
    if (report.file?.id) {
      report.downloadUrl = await this.reportStrategyService.getDownloadUrl(
        report,
      );
    }
    return report;
  }
}

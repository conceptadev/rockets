import { Inject } from '@nestjs/common';
import { ReportCreatableInterface } from '@concepta/ts-common';
import { mapNonErrorToException } from '@concepta/ts-core';
import { ReportGeneratorServiceNotFoundException } from '../exceptions/report-generator-service-not-found.exception';
import { ReportTimeoutException } from '../exceptions/report-timeout.exception';
import { ReportEntityInterface } from '../interfaces/report-entity.interface';
import { ReportGeneratorResultInterface } from '../interfaces/report-generator-result.interface';
import { ReportGeneratorServiceInterface } from '../interfaces/report-generator-service.interface';
import { ReportSettingsInterface } from '../interfaces/report-settings.interface';
import { ReportStrategyServiceInterface } from '../interfaces/report-strategy-service.interface';
import { REPORT_MODULE_SETTINGS_TOKEN } from '../report.constants';

export class ReportStrategyService implements ReportStrategyServiceInterface {
  private readonly reportGeneratorServices: ReportGeneratorServiceInterface[] =
    [];
  constructor(
    @Inject(REPORT_MODULE_SETTINGS_TOKEN)
    private readonly settings: ReportSettingsInterface,
  ) {}

  public addStorageService(
    reportGeneratorService: ReportGeneratorServiceInterface,
  ): void {
    this.reportGeneratorServices.push(reportGeneratorService);
  }

  async generate(
    report: ReportEntityInterface,
  ): Promise<ReportGeneratorResultInterface> {
    try {
      const generatorService = this.resolveGeneratorService(report);
      const timeoutMs =
        generatorService.generateTimeout || this.settings.generateTimeout;

      return await Promise.race([
        generatorService.generate(report),
        this.createTimeout(timeoutMs),
      ]);
    } catch (error) {
      if (error instanceof ReportTimeoutException) {
        throw error;
      }
      throw mapNonErrorToException(error);
    }
  }

  async getDownloadUrl(report: ReportCreatableInterface): Promise<string> {
    return this.resolveGeneratorService(report).getDownloadUrl(report);
  }

  protected resolveGeneratorService(
    report: ReportCreatableInterface,
  ): ReportGeneratorServiceInterface {
    const generatorService = this.reportGeneratorServices.find(
      (storageService) => {
        return storageService.KEY === report.serviceKey;
      },
    );

    if (generatorService) {
      return generatorService;
    }

    throw new ReportGeneratorServiceNotFoundException(report.serviceKey);
  }

  protected createTimeout(timeoutMs: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new ReportTimeoutException()), timeoutMs);
    });
  }
}

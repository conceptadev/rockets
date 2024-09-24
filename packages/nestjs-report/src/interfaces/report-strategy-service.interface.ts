import { ReportCreatableInterface } from '@concepta/ts-common';
import { ReportGeneratorResultInterface } from './report-generator-result.interface';

export interface ReportStrategyServiceInterface {
  generate(
    report: ReportCreatableInterface,
  ): Promise<ReportGeneratorResultInterface>;
  getDownloadUrl(report: ReportCreatableInterface): Promise<string>;
}

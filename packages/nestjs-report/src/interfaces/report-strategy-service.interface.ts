import { ReportInterface } from '@concepta/ts-common';
import { ReportGeneratorResultInterface } from './report-generator-result.interface';

export interface ReportStrategyServiceInterface {
  generate(report: ReportInterface): Promise<ReportGeneratorResultInterface>;
  getDownloadUrl(report: ReportInterface): Promise<string>;
}

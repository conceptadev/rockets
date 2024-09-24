import { ReportCreatableInterface } from '@concepta/ts-common';
import { ReportGeneratorResultInterface } from './report-generator-result.interface';

export interface ReportGeneratorServiceInterface {
  KEY: string;
  generateTimeout: number;
  generate(
    report: ReportCreatableInterface,
  ): Promise<ReportGeneratorResultInterface>;
  getDownloadUrl(report: ReportCreatableInterface): Promise<string>;
}

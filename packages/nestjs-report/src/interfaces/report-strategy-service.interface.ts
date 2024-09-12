import { ReportEntityInterface } from './report-entity.interface';
import { ReportGeneratorResultInterface } from './report-generator-result.interface';
import { ReportGeneratorServiceInterface } from './report-generator-service.interface';

export interface ReportStrategyServiceInterface {
  generate(
    report: ReportEntityInterface,
  ): Promise<ReportGeneratorResultInterface>;
  getDownloadUrl(report: ReportEntityInterface): Promise<string>;
  resolveGeneratorService(
    report: ReportEntityInterface,
  ): ReportGeneratorServiceInterface;
}

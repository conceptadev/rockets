import { ReportSettingsInterface } from './report-settings.interface';
import { ReportGeneratorServiceInterface } from './report-generator-service.interface';

export interface ReportOptionsInterface {
  reportGeneratorServices?: ReportGeneratorServiceInterface[];
  settings?: ReportSettingsInterface;
}

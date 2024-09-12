import { ReportEntityInterface } from './report-entity.interface';

export interface ReportGeneratorResultInterface
  extends Pick<ReportEntityInterface, 'id' | 'status' | 'file'>,
    Partial<Pick<ReportEntityInterface, 'errorMessage'>> {}

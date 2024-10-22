import { ReportInterface } from './report.interface';

export interface ReportUpdatableInterface
  extends Pick<ReportInterface, 'status' | 'file'>,
    Partial<Pick<ReportInterface, 'errorMessage'>> {}

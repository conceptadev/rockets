import { ReportInterface } from '@concepta/ts-common';

export interface ReportGeneratorResultInterface
  extends Pick<ReportInterface, 'id' | 'status' | 'file'>,
    Partial<Pick<ReportInterface, 'errorMessage'>> {}

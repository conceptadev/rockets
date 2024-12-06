import { DoneCallback } from '../report.types';
import { ReportCreateDto } from '../dto/report-create.dto';
import { ReportInterface } from '@concepta/nestjs-common';

export interface ReportServiceInterface {
  generate(report: ReportCreateDto): Promise<ReportInterface>;
  fetch(report: Pick<ReportInterface, 'id'>): Promise<ReportInterface>;
  done: DoneCallback;
}

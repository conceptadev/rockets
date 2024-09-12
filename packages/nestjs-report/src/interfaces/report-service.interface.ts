import { ReportEntityInterface } from './report-entity.interface';
import { DoneCallback } from '../report.types';
import { ReportCreateDto } from '../dto/report-create.dto';

export interface ReportServiceInterface {
  generate(report: ReportCreateDto): Promise<ReportEntityInterface>;
  fetch(
    report: Pick<ReportEntityInterface, 'id'>,
  ): Promise<ReportEntityInterface>;
  done: DoneCallback;
}

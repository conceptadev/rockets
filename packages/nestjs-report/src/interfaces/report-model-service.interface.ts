import {
  ByIdInterface,
  ReferenceId,
  ReportCreatableInterface,
  ReportInterface,
  ReportUpdatableInterface,
} from '@concepta/nestjs-common';
import {
  CreateOneInterface,
  ReferenceIdInterface,
  UpdateOneInterface,
} from '@concepta/nestjs-common';
import { ReportEntityInterface } from './report-entity.interface';

export interface ReportModelServiceInterface
  extends ByIdInterface<ReferenceId, ReportEntityInterface>,
    CreateOneInterface<ReportCreatableInterface, ReportEntityInterface>,
    UpdateOneInterface<ReportUpdatableInterface, ReportEntityInterface> {
  getUniqueReport(
    org: Pick<ReportCreatableInterface, 'serviceKey' | 'name'>,
  ): Promise<ReportInterface | null>;
  getWithFile(report: ReferenceIdInterface): Promise<ReportInterface | null>;
}
